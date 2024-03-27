import { createUUID } from "./uuid.js";

// TODO make all usages await where appropriate

// Function used to setup the local storage of the extension
async function setup() {
  let { host, uuid } = await chrome.storage.local.get(["host", "uuid"]);

  if (!uuid) {
    var uuid_val = createUUID();
    await chrome.storage.local.set({ uuid: uuid_val });

    console.log("UUID set to " + uuid_val);
  }

  if (!host) {
    await chrome.storage.local.set({ host: "http://localhost:5000" });

    console.log("Host set to localhost");
  }
}

async function storeResponse(url, response) {
  let { urlCacheIds } = await chrome.storage.local.get({ urlCacheIds: [] });

  // Finds cache entry associated with urlkey
  let i = urlCacheIds.findIndex(cacheEntry => cacheEntry.urlId == url);
  if (i != -1) {
    // Found cache entry, update it
    urlCacheIds[i].result = response;
    urlCacheIds[i].ack = false;
  } else {
    // Didn't find cache entry, add it
    urlCacheIds.push({
      urlId: url,
      result: response,
      ack: false,
    });
  }

  await chrome.storage.local.set({ urlCacheIds: urlCacheIds });
}

// NOT USED
async function deleteResponse(urlkey) {
  let { urlCacheIds } = await chrome.storage.local.get({ urlCacheIds: [] });

  let i = urlCacheIds.findIndex(cacheEntry => cacheEntry.urlId == urlkey);
  if (i != -1) {
    urlCacheIds.splice(i, 1);
    await chrome.storage.local.set({ urlCacheIds: urlCacheIds });
  }
}

// Delete all urlCacheIds content in local storage
async function clearUrlStorage() {
  await chrome.storage.local.remove("urlCacheIds");

  console.log("urlCacheIds removed successfully.");
}

// clear all local storage
async function clearAllStorage() {
  await chrome.storage.local.clear();

  console.log("Storage cleared successfully.");
}

async function setHost(host) {
  console.log("Setting host to: " + host);

  await chrome.storage.local.set({ host: host });

  console.log("Server host set to: " + host);
}

async function getHost() {
  return await chrome.storage.local.get("host");
}

async function getUuid() {
  return await chrome.storage.local.get("uuid");
}

export {
  setup,
  clearUrlStorage,
  clearAllStorage,
  storeResponse,
  deleteResponse,
  setHost,
  getUuid
};
