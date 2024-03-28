import { setup, storeResponse, getUuid, getHost, getResponse } from "./storage.js";
import { fetchApi, updateBadge } from "./util.js";

chrome.runtime.onInstalled.addListener(async () => {
  console.log("Installed");
  await setup();
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type !== "CHECK_PHISHING") {
    return;
  }

  updateBadge();

  // if tab is not active, we can't get the screenshot
  // So we leave it to the OnActivated listener
  if (!sender.tab.active) {
    return;
  }

  const uuid = await getUuid();
  process(sender.tab.id, sender.tab.url, sender.tab.title, "", uuid);
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type !== "WHITELIST_PAGE") {
    return;
  }

  let url = request.url;

  await storeResponse(url, "LEGITIMATE");
  setIcon("LEGITIMATE", sender.tab.id);
  updateBadge();
})

// Clear local storage on fresh chrome startup
chrome.runtime.onStartup.addListener(() => {
  clearUrlStorage();
  updateBadge();
});

async function process(tabid, url, title, screenshot, uuid) {
  const { result } = await getResponse(url);
  setIcon(result, tabid);

  chrome.tabs.sendMessage(tabid, {
    type: "CHECK_STATUS",
    result: result,
    url: url,
  });
  if (result !== "QUEUED" && result !== "PROCESSING") {
    return;
  }

  setIcon("waiting", tabid);

  // we do still need processing
  //console.log("New URL is " + urlkey + " and title is  " + title + " and screenshot data " + screenshot);

  // add url to cache so we do not process twice before result is known.
  await storeResponse(url, "QUEUED");

  const host = await getHost();

  if (!host) {
    console.error("The IP of the host is not set.");
    return;
  }

  try {
    const res = await fetchApi('POST', '/check', {
      URL: url,
      pagetitle: title,
      uuid: uuid,
    });
    const jsonResp = await res.json();

    await storeResponse(url, jsonResp.result);
    updateBadge();
    
    console.log(jsonResp.result);

    if (jsonResp.result == "PROCESSING") {
      await checkAgain(tabid, url, title, screenshot, uuid, 0);
    } else {
      setIcon(jsonResp.result, tabid);

      chrome.tabs.sendMessage(tabid, {
        type: "CHECK_STATUS",
        result: jsonResp.result,
        url: jsonResp.url,
      });
    }
  } catch (e) {
    console.error(e);
    await checkAgain(tabid, url, title, screenshot, uuid, 0);
  }
}

async function checkAgain(tabid, urlkey, title, screenshot, uuid, i) {
  const res = await fetchApi("POST", "/check", {
    URL: urlkey,
    pagetitle: title,
    uuid: uuid,
  });
  const jsonResp = await res.json();
  
  await storeResponse(urlkey, jsonResp.result);
  updateBadge();
  
  if (i > 50) {
    //deleteResponse(urlkey)
    // stop checking.. takes too long (server down?)
  } else if (jsonResp.result == "PROCESSING") {
    setTimeout(
      () => checkAgain(tabid, urlkey, title, screenshot, uuid, ++i),
      2000
    );
  } else {
    console.log("late response sent to tab");
    
    setIcon(jsonResp.result, tabid);
    
    chrome.tabs.sendMessage(tabid, {
      type: "CHECK_STATUS",
      result: jsonResp.result,
      url: urlkey,
    });
  }
}

function setIcon(icon, tabid) {
  let path = "/images/";
  if (icon === "questionmark" || icon === "INCONCLUSIVE") {
    path += "questionmark";
  } else if (icon === "phishing" || icon === "PHISHING") {
    path += "phishing";
  } else if (icon === "not_phishing" || icon === "LEGITIMATE") {
    path += "not_phishing";
  } else if (icon === "waiting" || icon === "PROCESSING" || icon === "QUEUED") {
    path += "waiting";
  } else if (icon === "idle") {
    path += "idle";
  }

  chrome.action.setIcon({
    path: {
      16: "/images/" + icon + "_16.png",
      32: "/images/" + icon + "_32.png",
      64: "/images/" + icon + "_64.png",
      128: "/images/" + icon + "_128.png"
    },
    tabId: tabid,
  });
}
