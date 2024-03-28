import { setup, storeResponse, getUuid, getHost, getResponse, clearUrlStorage } from "./storage.js";
import { fetchCheck, fetchState, updateBadge } from "./util.js";

// Setup storage when extension is installed
chrome.runtime.onInstalled.addListener(async () => {
  console.log("Installed");

  await setup();
});

// Clear URL cache on fresh chrome startup
chrome.runtime.onStartup.addListener(() => {
  clearUrlStorage();
  updateBadge();
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type !== "CHECK_PHISHING") {
    return;
  }

  updateBadge();

  const uuid = await getUuid();
  process(sender.tab.id, sender.tab.url, sender.tab.title, uuid);
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type !== "WHITELIST_PAGE") {
    return;
  }

  let url = request.url;

  await storeResponse(url, "LEGITIMATE");
  setIcon(sender.tab.id, "LEGITIMATE");
  updateBadge();
});

async function process(tabId, url, title, uuid) {
  const { result } = await getResponse(url);
  setIcon(tabId, result);

  chrome.tabs.sendMessage(tabId, {
    type: "CHECK_STATUS",
    result: result,
    url: url,
  });
  if (result !== "QUEUED" && result !== "PROCESSING") {
    return;
  }

  setIcon(tabId, "waiting");

  // we do still need processing
  //console.log("New URL is " + urlkey + " and title is  " + title);

  // add url to cache so we do not process twice before result is known.
  await storeResponse(url, "QUEUED");

  const host = await getHost();

  if (!host) {
    console.error("host not set");
    return;
  }

  try {
    const { result } = await fetchCheck(url, uuid, title);

    await storeResponse(url, result);
    updateBadge();

    console.log(result);

    if (result == "PROCESSING") {
      await checkAgain(tabId, url, uuid, title);
    } else {
      setIcon(tabId, result);

      chrome.tabs.sendMessage(tabId, {
        type: "CHECK_STATUS",
        result: result,
        url: jsonResp.url,
      });
    }
  } catch (e) {
    console.error(e);
    await checkAgain(tabId, url, uuid, title);
  }
}

async function checkAgain(tabId, url, uuid, title, i=0) {
  const { result } = await fetchState(url, uuid);

  if (i > 50) {
    // TODO: reenable?
    //deleteResponse(urlkey)
    // stop checking.. takes too long (server down?)
  } else if (result == "PROCESSING") {
    setTimeout(
      () => checkAgain(tabId, url, title, uuid, i + 1),
      2000
    );
  } else {
    console.log("late response sent to tab");

    setIcon(tabId, result);

    chrome.tabs.sendMessage(tabId, {
      type: "CHECK_STATUS",
      result: result,
      url: url,
    });
  }
}

function setIcon(tabId, icon) {
  let filename;
  if (icon === "questionmark" || icon === "INCONCLUSIVE") {
    filename = "questionmark";
  } else if (icon === "phishing" || icon === "PHISHING") {
    filename = "phishing";
  } else if (icon === "not_phishing" || icon === "LEGITIMATE") {
    filename = "not_phishing";
  } else if (icon === "waiting" || icon === "PROCESSING" || icon === "QUEUED") {
    filename = "waiting";
  } else if (icon === "idle") {
    filename = "idle";
  }

  chrome.action.setIcon({
    path: {
      16: "/images/" + filename + "_16.png",
      32: "/images/" + filename + "_32.png",
      64: "/images/" + filename + "_64.png",
      128: "/images/" + filename + "_128.png"
    },
    tabId: tabId,
  });
}
