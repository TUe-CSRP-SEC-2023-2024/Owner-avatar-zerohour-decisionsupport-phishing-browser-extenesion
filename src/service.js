import { getCacheResult, storeCacheResult, getNotificationSettings } from "./storage.js";
import { getDefinitiveState, checkUntilDone, updateBadge } from "./util.js";

// Update badge when we start chrome for the first time
chrome.runtime.onStartup.addListener(updateBadge);

// Listener for phishing check requests
chrome.runtime.onMessage.addListener(async (request, sender) => {
  if (request.type !== "CHECK_PHISHING") {
    return;
  }

  process(sender.tab.id, sender.tab.url, sender.tab.title);
});

// Listener for page whitelist requests
chrome.runtime.onMessage.addListener(async (request, sender) => {
  if (request.type !== "WHITELIST_PAGE") {
    return;
  }

  let url = request.url;

  await storeCacheResult(url, "LEGITIMATE");
  showState(sender.tab.id, url, "LEGITIMATE");
});

// Listener for notification settings requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type !== "REQUEST_NOTIFICATION_SETTINGS") {
    return false;
  }

  getNotificationSettings().then(sendResponse);
  // TODO: default settings

  return true;
});

/**
 * Processes a phishing check request for an open webpage.
 * 
 * @param {*} tabId the ID of the tab to run the check on.
 * @param {*} url the URL to check.
 * @param {*} title the title of the webpage to check.
 */
async function process(tabId, url, title) {
  // Check if result cached
  let result = await getCacheResult(url);
  if (result) {
    showState(tabId, url, result);

    // If URL handled by another tab, await result of that
    if (result === "QUEUED" || result === "PROCESSING") {
      result = await getDefinitiveState(url);
    }

    showState(tabId, url, result);

    return;
  }

  // TODO if the server is changed to instantly return an HTTP response on the check endpoint,
  //        we should add an intermediate QUEUED phase
  // Start processing
  await storeCacheResult(url, "PROCESSING");
  showState(tabId, url, "PROCESSING");

  try {
    // Query server
    const result = await checkUntilDone(url, title);

    await storeCacheResult(url, result);
    showState(tabId, url, result);

    console.log("Check result from server: " + result);
  } catch (e) {
    console.error(e);
    // TODO properly handle errors here, relating to cache state
  }
}

/**
 * Updates the visuals on the webpage indicating which result the tool gave.
 * 
 * Includes notification methods, extension icon and extension badge.
 * 
 * @param {*} tabId the Chrome tab ID to send the result to.
 * @param {*} url the URL the result is for.
 * @param {*} result the result itself.
 */
function showState(tabId, url, result) {
  setIcon(tabId, result);

  updateBadge();
  
  chrome.tabs.sendMessage(tabId, {
    type: "CHECK_STATUS",
    result: result,
    url: url,
  });
}

/**
 * Sets the extension icon on the given tab to the given variant.
 * 
 * @param {number} tabId the ID of the tab.
 * @param {string} icon the icon variant to change to.
 */
async function setIcon(tabId, icon) {
  console.log('setting icon of ' + tabId + ' to ' + icon);

  // Convert icon variant to filename
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
  } else {
    throw new Error("unkown icon variant: `" + icon + "`");
  }

  // Then change the icon
  await chrome.action.setIcon({
    path: {
      16: "/images/" + filename + "_16.png",
      32: "/images/" + filename + "_32.png",
      64: "/images/" + filename + "_64.png",
      128: "/images/" + filename + "_128.png"
    },
    tabId: tabId,
  });
}
