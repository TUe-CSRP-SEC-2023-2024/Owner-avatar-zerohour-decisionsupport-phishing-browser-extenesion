import { getHost, getAllPhishingResponses } from "./storage.js";

// TODO incorporate json in this already?
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

async function fetchState(url, uuid) {
  const res = await fetchApi('POST', '/state', {
    URL: url,
    uuid: uuid,
  });

  return res.json()[0]; // TODO: is 0 index still required?
}

async function fetchCheck(url, uuid, title) {
  const res = await fetchApi('POST', '/check', {
    URL: url,
    uuid: uuid,
    pagetitle: title
  });
  return await res.json();
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
  fetchState,
  fetchCheck,
  updateBadge
};
