import { getHost } from "./storage";

async function fetchApi(method, endpoint, jsonObj={}) {
  const host = await getHost();

  return await fetch(host + "/api/v2" + endpoint, {
    method: method,
    body: JSON.stringify(jsonObj),
    headers: {
      "Content-Type": "application/json"
    }
  });
}

async function updateBadge() {
  const count = (await getAllPhishingResponses()).length;

  if (count != 0) {
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 255], });
  } else {
    chrome.action.setBadgeText({ text: "", });
  }
}


export {
  fetchApi,
  updateBadge
};