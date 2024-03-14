import { setup, storeResponse, deleteResponse } from "./storage.js";

chrome.runtime.onInstalled.addListener(() => {
  console.log("Installed");
  setup();
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
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
          if (
            result.urlCacheIds[i].status == "queued" ||
            result.urlCacheIds.status == "PROCESSING"
          ) {
            chrome.action.setIcon({
              path: {
                16: "/images/waiting_16.png",
                32: "/images/waiting_32.png",
                64: "/images/waiting_64.png",
                128: "/images/waiting_128.png",
              },
              tabId: tabid,
            });
          } else if (result.urlCacheIds[i].status == "INCONCLUSIVE") {
            chrome.action.setIcon({
              path: {
                16: "/images/questionmark_16.png",
                32: "/images/questionmark_32.png",
                64: "/images/questionmark_64.png",
                128: "/images/questionmark_128.png",
              },
              tabId: tabid,
            });
          } else if (result.urlCacheIds[i].status == "PHISHING") {
            chrome.action.setIcon({
              path: {
                16: "/images/phishing_16.png",
                32: "/images/phishing_32.png",
                64: "/images/phishing_64.png",
                128: "/images/phishing_128.png",
              },
              tabId: tabid,
            });
          } else if (result.urlCacheIds[i].status == "LEGITIMATE") {
            console.log("Icon set to not_phishing");
            chrome.action.setIcon({
              path: {
                16: "/images/not_phishing_16.png",
                32: "/images/not_phishing_32.png",
                64: "/images/not_phishing_64.png",
                128: "/images/not_phishing_128.png",
              },
              tabId: tabid,
            });
          }

          chrome.tabs.sendMessage(tabid, {
            status: result.urlCacheIds[i].status,
            url: urlkey,
          });
          if (
            result.urlCacheIds[i].status != "queued" &&
            result.urlCacheIds[i].status != "PROCESSING"
          ) {
            return;
          }
        }
      }

      chrome.action.setIcon({
        path: {
          16: "/images/waiting_16.png",
          32: "/images/waiting_32.png",
          64: "/images/waiting_64.png",
          128: "/images/waiting_128.png",
        },
        tabId: tabid,
      });

      // we do still need processing
      //console.log("New URL is " + urlkey + " and title is  " + title + " and screenshot data " + screenshot);

      // add url to cache so we do not process twice before result is known.
      storeResponse(urlkey, "queued");

      var jsonData = JSON.stringify({
        data: {
          URL: urlkey,
          pagetitle: title,
          uuid: uuid,
        },
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
            res.json();
          })
          .then((data) => {
            jsonResp = JSON.stringify(data[0]);
            jsonResp = JSON.parse(jsonResp);
            storeResponse(urlkey, jsonResp.result);
            updateBadge();
            console.log(jsonResp.result);

            if (jsonResp.result == "PROCESSING") {
              checkLoop(tabid, urlkey, title, screenshot, uuid, 0);
            } else {
              // change icon
              if (jsonResp.result == "PHISHING") {
                chrome.action.setIcon({
                  path: {
                    16: "/images/phishing_16.png",
                    32: "/images/phishing_32.png",
                    64: "/images/phishing_64.png",
                    128: "/images/phishing_128.png",
                  },
                  tabId: tabid,
                });
              } else if (jsonResp.result == "LEGITIMATE") {
                chrome.action.setIcon({
                  path: {
                    16: "/images/not_phishing_16.png",
                    32: "/images/not_phishing_32.png",
                    64: "/images/not_phishing_64.png",
                    128: "/images/not_phishing_128.png",
                  },
                  tabId: tabid,
                });
              } else if (jsonResp.result == "INCONCLUSIVE") {
                chrome.action.setIcon({
                  path: {
                    16: "/images/questionmark_16.png",
                    32: "/images/questionmark_32.png",
                    64: "/images/questionmark_64.png",
                    128: "/images/questionmark_128.png",
                  },
                  tabId: tabid,
                });
              }
              chrome.tabs.sendMessage(tabid, {
                status: jsonResp.status,
                url: jsonResp.url,
              });
            }
          })
          .catch((err) => {
            // An error occured. This can be the timeout, or some other error.
            console.log(err);
            checkLoop(tabid, urlkey, title, screenshot, uuid, 0);
          });
      });
    }
  );
}

function checkLoop(tabid, urlkey, title, screenshot, uuid, i) {
  res = checkAgain(tabid, urlkey, title, screenshot, uuid, i);
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
        jsonResp = JSON.stringify(data[0]);
        jsonResp = JSON.parse(jsonResp);
        storeResponse(urlkey, jsonResp.result);
        updateBadge();
        if (i > 50) {
          //deleteResponse(urlkey)
          // stop checking.. takes too long (server down?)
        } else if (jsonResp.result == "PROCESSING") {
          setTimeout(
            checkLoop(tabid, urlkey, title, screenshot, uuid, ++i),
            2000
          );
        } else {
          console.log("late response sent to tab");
          // change icon
          if (jsonResp.result == "PHISHING") {
            chrome.action.setIcon({
              path: {
                16: "/images/phishing_16.png",
                32: "/images/phishing_32.png",
                64: "/images/phishing_64.png",
                128: "/images/phishing_128.png",
              },
              tabId: tabid,
            });
          } else if (jsonResp.result == "LEGITIMATE") {
            console.log("Icon set to not_phishing");
            chrome.action.setIcon({
              path: {
                16: "/images/not_phishing_16.png",
                32: "/images/not_phishing_32.png",
                64: "/images/not_phishing_64.png",
                128: "/images/not_phishing_128.png",
              },
              tabId: tabid,
            });
          } else if (jsonResp.result == "INCONCLUSIVE") {
            chrome.action.setIcon({
              path: {
                16: "/images/questionmark_16.png",
                32: "/images/questionmark_32.png",
                64: "/images/questionmark_64.png",
                128: "/images/questionmark_128.png",
              },
              tabId: tabid,
            });
          }
          chrome.tabs.sendMessage(tabid, {
            status: jsonResp.result,
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
          result.urlCacheIds[i].status == "PHISHING" &&
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
