import { getUuid, getHost, getAllPhishingCacheEntries } from "./storage.js";

// TODO move some functions here to new api.js, that does all contact with API?
// TODO remove UUID from everywhere
// TODO deal with 404 from state endpoint

/**
 * Makes a call to the API.
 * 
 * @param {string} endpoint the endpoint to use.
 * @param {string} method the method (typically GET or POST, default GET).
 * @param {*} jsonObj the data object to send.
 * @returns 
 */
async function fetchApi(endpoint, method='GET', jsonObj=undefined) {
  const host = await getHost();

  let headers = {};
  let body = undefined;

  if (jsonObj) {
    body = JSON.stringify(jsonObj);
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(host + "/api/v2" + endpoint, {
    method: method,
    body: body,
    headers: headers
  });

  return await res.json();
}

/**
 * Fetches the state of a certain check that is in progress or has finished.
 * 
 * @param {string} url the URL.
 * @param {string} uuid the UUID.
 * @returns 
 */
async function getCheckState(url, uuid) {
  const json = await fetchApi('/state', 'POST', {
    URL: url,
    uuid: uuid,
  });

  return json[0];
}

/**
 * Requests a check to be ran.
 * 
 * @param {string} url the URL to check.
 * @param {string} uuid the UUID.
 * @param {string} title the title of the page.
 * @returns 
 */
async function requestCheck(url, uuid, title) {
  return await fetchApi('/check', 'POST', {
    URL: url,
    uuid: uuid,
    pagetitle: title
  });
}

/**
 * Requests a check, and only returns when we have a definitive result.
 * 
 * @param {string} url the URL.
 * @param {string} title the page title.
 * @returns 
 */
async function checkUntilDone(url, title) {
  console.log('Initiating full check on ' + url);

  const uuid = await getUuid();

  let { result } = await requestCheck(url, uuid, title);

  if (result === "PROCESSING") {
    result = await getDefinitiveState(url, uuid);
  }

  return result;
}

/**
 * Gets the definitive state of a previously requested check,
 * possibly waiting until it is available.
 * 
 * @param {string} url the URL to get the state for.
 * @returns the state.
 */
async function getDefinitiveState(url) {
  console.log('Fetching final state on ' + url);

  const uuid = await getUuid();

  while (true) {
    await timeout(2000);

    const res = await getCheckState(url, uuid);
    if (res.result !== "PROCESSING") {
      return res.result;
    }
  }
}

/**
 * Returns a promise that finishes after the given amount of milliseconds have passed.
 * 
 * When awaited, this acts as an async sleep instruction.
 * 
 * @param {number} ms the amount of milliseconds.
 * @returns 
 */
function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Updates the badge of the extension with the amount of phishing cache entries.
 */
async function updateBadge() {
  const count = (await getAllPhishingCacheEntries()).length;

  if (count != 0) {
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 255], });
  } else {
    chrome.action.setBadgeText({ text: "", });
  }
}

export {
  fetchApi,
  getCheckState,
  requestCheck,
  checkUntilDone,
  getDefinitiveState,
  updateBadge
};
