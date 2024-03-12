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

// Yes, a UUID that is based on Math.random is not a good uuid
// For the purposes it is used, it is more than fine
function createUUID() {
  var dt = new Date().getTime();
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    }
  );
  return uuid;
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

// NOT USED
// Read all data in local storage
function readAllStorage() {
  chrome.storage.local.get(
    null,
    //{urlCacheIds: []}
    function (result) {
      // result is an object containing all the key-value pairs in storage
      console.log(result);
    }
  );
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

export { setup, createUUID, clearUrlStorage, readAllStorage, clearAllStorage };
