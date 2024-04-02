import { createUUID } from "./uuid.js";

/**
 * Gets the cached phishing check entry for a URL.
 * 
 * @param {string} url the URL to get the result for.
 * @returns the cache entry, or `undefined` if it wasn't found in cache.
 */
async function getCacheEntry(url) {
  let { urlCacheIds } = await chrome.storage.local.get({ urlCacheIds: [] });

  // Finds cache entry associated with urlkey
  let cacheEntry = urlCacheIds.find(cacheEntry => cacheEntry.urlId == url);

  return cacheEntry;
}

/**
 * Gets the cached phishing check result for a URL.
 * 
 * @param {string} url the URL to get the result for.
 * @returns the result, or `undefined` if it wasn't found in cache.
 */
async function getCacheResult(url) {
  let { urlCacheIds } = await chrome.storage.local.get({ urlCacheIds: [] });

  // Finds cache entry associated with urlkey
  let cacheEntry = urlCacheIds.find(cacheEntry => cacheEntry.urlId == url);

  if (cacheEntry) {
    return cacheEntry.result;
  }

  return undefined;
}

/**
 * Stores the given cache entry in cache.
 * 
 * @param {string} url the URL to store it under.
 * @param {*} result the cache entry to store.
 */
async function storeCacheResult(url, result) {
  let { urlCacheIds } = await chrome.storage.local.get({ urlCacheIds: [] });

  // Finds cache entry associated with urlkey
  let i = urlCacheIds.findIndex(iCacheEntry => iCacheEntry.urlId == url);
  if (i != -1) {
    // Found cache entry, update it
    urlCacheIds[i].result = result;
    urlCacheIds[i].ack = false;
  } else {
    // Didn't find cache entry, add it
    urlCacheIds.push({
      urlId: url,
      result: result,
      ack: false,
    });
  }

  await chrome.storage.local.set({ urlCacheIds: urlCacheIds });
}

/**
 * Deletes the cache entry under the given URL.
 * 
 * @param {string} url the URL to delete the cache entry for.
 */
async function deleteCacheEntry(url) {
  let { urlCacheIds } = await chrome.storage.local.get({ urlCacheIds: [] });

  let i = urlCacheIds.findIndex(cacheEntry => cacheEntry.urlId == url);
  if (i != -1) {
    urlCacheIds.splice(i, 1);
    await chrome.storage.local.set({ urlCacheIds: urlCacheIds });
  }
}

/**
 * Returns all cache entries with result phishing.
 * 
 * @returns the phishing cache entries.
 */
async function getAllPhishingCacheEntries() {
  let { urlCacheIds } = await chrome.storage.local.get({ urlCacheIds: [] });

  return urlCacheIds.filter(cacheEntry => 
      cacheEntry.ack != true && cacheEntry.status == "phishing");
}

/**
 * Acknowledge the existence of the phishing page with the given URL.
 * 
 * @param {string} url the URL.
 */
async function acknowledgePhishingPage(url) {
  let { urlCacheIds } = await chrome.storage.local.get({ urlCacheIds: [] });

  // Finds cache entry associated with urlkey
  let i = urlCacheIds.findIndex(cacheEntry => cacheEntry.urlId == url);

  if (i == -1) {
    throw new Error("Could not find phishing entry by URL `" + url + "`");
  }

  urlCacheIds[i].ack = true;
  await chrome.storage.local.set({ urlCacheIds: urlCacheIds });
}

/**
 * Clears all cache.
 */
async function clearCache() {
  await chrome.storage.local.remove("urlCacheIds");

  console.log("urlCacheIds removed successfully.");
}

/**
 * Clears all storage, including cache and settings.
 */
async function clearStorage() {
  await chrome.storage.local.clear();

  console.log("Storage cleared successfully.");
}

/**
 * Sets the host (server connection URL).
 * 
 * @param {string} host the host to switch to.
 */
async function setHost(host) {
  console.log("Setting host to: " + host);

  await chrome.storage.local.set({ host: host });

  console.log("Server host set to: " + host);
}

/**
 * Gets the host (server connection URL).
 * 
 * @returns the host.
 */
async function getHost() {
  let { host } = await chrome.storage.local.get("host");

  if (!host) {
    host = "http://localhost:5000";
    
    await setHost(host);
  }

  return host;
}

/**
 * Gets the UUID of this client.
 * 
 * @returns the UUID.
 */
async function getUuid() {
  let { uuid } = await chrome.storage.local.get("uuid");

  if (!uuid) {
    var uuid_val = createUUID();
    await chrome.storage.local.set({ uuid: uuid_val });

    console.log("UUID set to " + uuid_val);

    return uuid_val;
  }

  return uuid;
}

export {
  getCacheEntry,
  getCacheResult,
  storeCacheResult,
  deleteCacheEntry,
  getAllPhishingCacheEntries,
  acknowledgePhishingPage,
  clearCache,
  clearStorage,
  setHost,
  getHost,
  getUuid
};
