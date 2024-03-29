import { getUuid, getHost, getAllPhishingResponses } from "./storage.js";

// TODO move some functions here to new api.js, that does all contact with API?
// TODO document it all & give them good names

// TODO incorporate json in this already?
async function fetchApi(method, endpoint, jsonObj=undefined) {
  const host = await getHost();

  let headers = {};
  let body = undefined;

  if (jsonObj) {
    body = JSON.stringify(jsonObj);
    headers["Content-Type"] = "application/json";
  }

  return await fetch(host + "/api/v2" + endpoint, {
    method: method,
    body: body,
    headers: headers
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

async function fullCheck(url, title) {
  console.log('Initiating full check on ' + url);

  const uuid = await getUuid();

  let { result } = await fetchCheck(url, uuid, title);

  if (result === "PROCESSING") {
    result = await fetchFinalState(url, uuid);
  }

  return result;
}

async function fetchFinalState(url) {
  console.log('Fetching final state on ' + url);

  const uuid = await getUuid();

  while (true) {
    await timeout(2000);

    const res = await fetchState(url, uuid);
    if (res.result !== "PROCESSING") {
      return res.result;
    }
  }
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
  fullCheck,
  fetchFinalState,
  updateBadge
};
