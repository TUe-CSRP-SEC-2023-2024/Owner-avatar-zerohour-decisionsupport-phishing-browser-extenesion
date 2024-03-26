import { createUUID } from "./uuid.js";

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

async function storeResponse(urlkey, response) {
  let { urlCacheIds } = await chrome.storage.local.get({ urlCacheIds: [] });

  let found = false;
  for (let i = 0; i < urlCacheIds.length; i++) {
    if (urlCacheIds[i].urlId == urlkey) {
      urlCacheIds[i].result = response;
      urlCacheIds[i].ack = false;

      found = true;
    }
  }

  if (!found) {
    urlCacheIds.push({
      urlId: urlkey,
      result: response,
      ack: false,
    });
  }

  await chrome.storage.local.set({ urlCacheIds: urlCacheIds });
}

// NOT USED
function deleteResponse(urlkey) {
  chrome.storage.local.get(
    {
      urlCacheIds: [],
    },
    function (result) {
      for (let i = 0; i < result.urlCacheIds.length; i++) {
        if (result.urlCacheIds[i].urlId == urlkey) {
          // delete entry
          result.urlCacheIds.splice(i, 1);

          // put array back
          chrome.storage.local.set(
            {
              urlCacheIds: result.urlCacheIds,
            },
            function (result) {}
          );
          break;
        }
      }
    }
  );
}

// Delete all urlCacheIds content in local storage
function clearUrlStorage() {
  chrome.storage.local.remove("urlCacheIds", function () {
    if (chrome.runtime.lastError) {
      console.error(
        "Error removing item from storage: " + chrome.runtime.lastError
      );
    } else {
      console.log("urlCacheIds removed successfully.");
    }
  });
}

// clear all local storage
function clearAllStorage() {
  chrome.storage.local.clear(function () {
    if (chrome.runtime.lastError) {
      console.error("Error clearing storage: " + chrome.runtime.lastError);
    } else {
      console.log("Storage cleared successfully.");
    }
  });
}

async function setHost(host) {
  console.log("Setting host to: " + host);

  await chrome.storage.local.set({ host: host });

  console.log("Server host set to: " + host);
}

async function getUuid() {
  let { uuid } = await chrome.storage.local.get(["uuid"]);
  return uuid;
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
