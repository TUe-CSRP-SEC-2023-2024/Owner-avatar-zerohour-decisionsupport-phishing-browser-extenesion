import { createUUID } from "./uuid.js";

// Function used to setup the local storage of the extension
function setup() {
  chrome.storage.local.get(["host", "uuid"], function (result) {
    if (result.uuid == "" || result.uuid == null) {
      var uuid_val = createUUID();
      chrome.storage.local.set(
        {
          uuid: uuid_val,
        },
        function () {
          console.log("uuid set to " + uuid_val);
        }
      );
    }

    if (result.host == "" || result.host == null) {
      chrome.storage.local.set(
        {
          host: "http://localhost:5000",
        },
        function () {
          console.log("host set to localhost");
        }
      );
    }
  });
}

function storeResponse(urlkey, response) {
  // Store the url and response in cache
  chrome.storage.local.get(
    {
      urlCacheIds: [],
    },
    function (result) {
      var found = false;
      for (let i = 0; i < result.urlCacheIds.length; i++) {
        if (result.urlCacheIds[i].urlId == urlkey) {
          result.urlCacheIds[i].result = response;
          result.urlCacheIds[i].ack = false;

          chrome.storage.local.set(
            {
              urlCacheIds: result.urlCacheIds,
            },
            function (result) {}
          );
          found = true;
          break;
        }
      }
      if (!found) {
        var urlCacheIds = result.urlCacheIds;
        urlCacheIds.push({
          urlId: urlkey,
          result: response,
          ack: false,
        });

        chrome.storage.local.set(
          {
            urlCacheIds: urlCacheIds,
          },
          function (result) {}
        );
      }
    }
  );
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

function setHost(host) {
  console.log("Setting host to: " + host);
  chrome.storage.local.set(
    {
      host: host,
    },
    function () {
      console.log("Server host set to: " + host);
    }
  );
}

export {
  setup,
  clearUrlStorage,
  clearAllStorage,
  storeResponse,
  deleteResponse,
  setHost,
};
