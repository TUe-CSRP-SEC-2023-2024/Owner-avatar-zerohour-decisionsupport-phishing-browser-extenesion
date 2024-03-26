import { setup, storeResponse } from "./storage.js";

chrome.runtime.onInstalled.addListener(() => {
  console.log("Installed");
  setup();
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type !== "CHECK_PHISHING") {
    return;
  }

  updateBadge();

  // if tab is not active, we can't get the screenshot
  // So we leave it to the OnActivated listener
  if (!sender.tab.active) {
    return;
  }

  chrome.storage.local.get(["uuid"], function (result) {
    process(sender.tab.id, sender.tab.url, sender.tab.title, "", result.uuid);
  });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type !== "WHITELIST_PAGE") {
    return;
  }

  let url = request.url;

  chrome.storage.local.get(
    {
      urlCacheIds: [],
    },
    function (result) {
      for (let i = 0; i < result.urlCacheIds.length; i++) {
        // Check if this is the current page
        if (result.urlCacheIds[i].urlId === url) {
          // Set it to legitimate and store the result
          result.urlCacheIds[i].result = "LEGITIMATE";

          chrome.storage.local.set(
            {
              urlCacheIds: result.urlCacheIds,
            },
            function (result) {}
          );

          // TODO: update icon & badge

          break;
        }
      }
    }
  );
})

// Clear local storage on fresh chrome startup
chrome.runtime.onStartup.addListener(() => {
  clearUrlStorage();
  updateBadge();
});

function process(tabid, urlkey, title, screenshot, uuid) {
  // check if url still needs processing
  chrome.storage.local.get(
    {
      urlCacheIds: [],
    },
    function (result) {
      for (let i = 0; i < result.urlCacheIds.length; i++) {
        if (result.urlCacheIds[i].urlId == urlkey) {
          // check status of tab for the icon change
          setIcon(result.urlCacheIds[i].result, tabid);

          chrome.tabs.sendMessage(tabid, {
            type: "CHECK_STATUS",
            result: result.urlCacheIds[i].result,
            url: urlkey,
          });
          if (
            result.urlCacheIds[i].result !== "QUEUED" &&
            result.urlCacheIds[i].result !== "PROCESSING"
          ) {
            return;
          }
        }
      }

      setIcon("waiting", tabid);

      // we do still need processing
      //console.log("New URL is " + urlkey + " and title is  " + title + " and screenshot data " + screenshot);

      // add url to cache so we do not process twice before result is known.
      storeResponse(urlkey, "QUEUED");

      var jsonData = JSON.stringify({
        URL: urlkey,
        pagetitle: title,
        uuid: uuid,
      });

      console.log(jsonData);
      chrome.storage.local.get(["host"], function (result) {
        if (result.host == "" || result.host == null) {
          console.error("The IP of the host is not set.");
          return;
        }

        let host = result.host;

        fetch(host + "/api/v2/check", {
          method: "POST",
          body: jsonData,
          headers: {
            "Content-Type": "application/json",
            Connection: "close",
            "Content-Length": jsonData.length,
          },
        })
          .then((res) => {
            return res.json();
          })
          .then((data) => {
            let jsonResp = JSON.parse(JSON.stringify(data));
            storeResponse(urlkey, jsonResp.result);
            updateBadge();
            console.log(jsonResp.result);

            if (jsonResp.result == "PROCESSING") {
              checkAgain(tabid, urlkey, title, screenshot, uuid, 0);
            } else {
              // change icon
              setIcon(jsonResp.result, tabid);
              chrome.tabs.sendMessage(tabid, {
                type: "CHECK_STATUS",
                result: jsonResp.result,
                url: jsonResp.url,
              });
            }
          })
          .catch((err) => {
            // An error occured. This can be the timeout, or some other error.
            console.log(err);
            checkAgain(tabid, urlkey, title, screenshot, uuid, 0);
          });
      });
    }
  );
}

function checkAgain(tabid, urlkey, title, screenshot, uuid, i) {
  var jsonData = JSON.stringify({
    URL: urlkey,
    pagetitle: title,
    uuid: uuid,
  });

  console.log(jsonData);

  chrome.storage.local.get(["host"], function (result) {
    if (result.host == "" || result.host == null) {
      console.error("The IP of the host is not set.");
    }

    let host = result.host;

    fetch(host + "/api/v2/check", {
      method: "POST",
      body: jsonData,
      headers: {
        "Content-Type": "application/json",
        Connection: "close",
        "Content-Length": jsonData.length,
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        let jsonResp = JSON.parse(JSON.stringify(data));
        storeResponse(urlkey, jsonResp.result);
        updateBadge();
        if (i > 50) {
          //deleteResponse(urlkey)
          // stop checking.. takes too long (server down?)
        } else if (jsonResp.result == "PROCESSING") {
          setTimeout(
            () => checkAgain(tabid, urlkey, title, screenshot, uuid, ++i),
            2000
          );
        } else {
          console.log("late response sent to tab");
          // change icon
          setIcon(jsonResp.result, tabid);
          chrome.tabs.sendMessage(tabid, {
            type: "CHECK_STATUS",
            result: jsonResp.result,
            url: urlkey,
          });
        }
      })
      .catch((err) => {
        // An error occured. This can be the timeout, or some other error.
        console.log(err);
        return "error";
      });
  });
}

function updateBadge() {
  chrome.storage.local.get(
    {
      urlCacheIds: [],
    },
    function (result) {
      var count = 0;
      for (let i = 0; i < result.urlCacheIds.length; i++) {
        if (
          result.urlCacheIds[i].result == "PHISHING" &&
          result.urlCacheIds[i].ack != true
        ) {
          count++;
        }
      }
      if (count != 0) {
        chrome.action.setBadgeText({
          text: count.toString(),
        });
        chrome.action.setBadgeBackgroundColor({
          color: [255, 0, 0, 255],
        });
      } else {
        chrome.action.setBadgeText({
          text: "",
        });
      }
    }
  );
}

function setIcon(icon, tabid) {
  let path = "/images/";
  if (icon === "questionmark" || icon === "INCONCLUSIVE") {
    path += "questionmark";
  } else if (icon === "phishing" || icon === "PHISHING") {
    path += "phishing";
  } else if (icon === "not_phishing" || icon === "LEGITIMATE") {
    path += "not_phishing";
  } else if (icon === "waiting" || icon === "PROCESSING" || icon === "QUEUED") {
    path += "waiting";
  } else if (icon === "idle") {
    path += "idle";
  }

  chrome.action.setIcon({
    path: {
      16: "/images/" + icon + "_16.png",
      32: "/images/" + icon + "_32.png",
      64: "/images/" + icon + "_64.png",
      128: "/images/" + icon + "_128.png"
    },
    tabId: tabid,
  });
}
