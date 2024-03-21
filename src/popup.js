chrome.tabs.query(
  {
    active: true,
    lastFocusedWindow: true,
  },
  (tabs) => {
    let url = tabs[0].url;
    let currUrl = document.getElementById("currUrl");
    let rating = document.getElementById("rating");
    let progressdiv = document.getElementById("progressdiv");
    let updatestatebutton = document.getElementById("get-state-button");
    let spinner = document.getElementById("spinner");
    let settingsBtn = document.getElementById("settings-button");
    // let step1 = document.getElementById("textsearch");
    // let step2 = document.getElementById("imagesearch");
    // let step3 = document.getElementById("imagecompare");
    // let spinner1 = document.getElementById("spinner1");
    // let spinner2 = document.getElementById("spinner2");
    // let spinner3 = document.getElementById("spinner3");
    let phishinglist = document.getElementById("phishinglist");

    settingsBtn.addEventListener("click", () => {
      chrome.runtime.openOptionsPage();
    });

    let displayUrl = url;

    // Cut part of the URL if it's too long
    if (url.length > 30) {
      displayUrl = url.slice(0, 30) + "...";
    }

    currUrl.textContent = displayUrl;

    updateContent();

    // Get response from cache to display in the pop-up
    function updateContent() {
      phishinglist.innerHTML = "";
      chrome.storage.local.get(
        {
          urlCacheIds: [],
        },
        function (result) {
          var i;
          if (result == null) {
            return;
          }
          console.log(result);
          var found = false;
          for (i = 0; i < result.urlCacheIds.length; i++) {
            if (result.urlCacheIds[i].urlId == url) {
              if (result.urlCacheIds[i].result == "LEGITIMATE") {
                rating.textContent = "No, you're safe!";
                found = true;
              } else if (result.urlCacheIds[i].result == "PHISHING") {
                rating.textContent = "Yes, be careful!";
                found = true;
              } else if (
                result.urlCacheIds[i].result == "QUEUED" ||
                result.urlCacheIds[i].result == "PROCESSING"
              ) {
                rating.textContent = "Waiting for result...";
                progressdiv.style.display = "block";
                updatestatebutton.style.display = "inline-block";
                found = true;
              } else if (result.urlCacheIds[i].result == "INCONCLUSIVE") {
                rating.textContent = "We're not sure about this one! Be alert!";
                found = true;
              }
            }
            if (
              result.urlCacheIds[i].ack != true &&
              result.urlCacheIds[i].status == "phishing"
            ) {
              // add to past phishing list
              document.getElementById("phishingtitle").style.display = "block";
              var div = document.createElement("div");
              div.className = "itemwrapper";
              div.innerHTML =
                '<div class="sitename"><span>' +
                result.urlCacheIds[i].urlId +
                '</span></div><div class="actions"><button id="ackbutton-' +
                i +
                '" class="actionbutton ackbutton">Dismiss</button><button id="whitelistbutton-' +
                i +
                '" class="actionbutton whitelistbutton">Whitelist</button></div>';
              phishinglist.appendChild(div);
              document.getElementById("ackbutton-" + i).url =
                result.urlCacheIds[i].urlId;
              document
                .getElementById("ackbutton-" + i)
                .addEventListener("click", ackPhish, false);
              document.getElementById("whitelistbutton-" + i).url =
                result.urlCacheIds[i].urlId;
              document
                .getElementById("whitelistbutton-" + i)
                .addEventListener("click", whitelistPhish, false);
            }
          }
          if (!found) {
            rating.textContent =
              "This page has no password field and will not be checked.";
          }
        }
      );
    }

    chrome.storage.local.get(["uuid"], function (result) {
      getUpdate(result.uuid, url);
    });

    var intervalId = window.setInterval(function () {
      chrome.storage.local.get(["uuid"], function (result) {
        getUpdate(result.uuid, url);
      });
    }, 5000);

    updatestatebutton.addEventListener("click", () => {
      chrome.storage.local.get(["uuid"], function (result) {
        getUpdate(result.uuid, url);
      });
    });

    function getUpdate(uuid, urlkey) {
      console.log("UUID: " + uuid + " URL: " + urlkey);

      chrome.storage.local
        .get(["host"], function (result) {
          if (result.host == "" || result.host == null) {
            console.error("The IP of the host is not set.");
            return;
          }

          var jsonData = JSON.stringify({
            URL: urlkey,
            uuid: uuid,
          });

          fetch(result.host + "/api/v2/state", {
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
              let jsonResp = JSON.stringify(data[0]);
              jsonResp = JSON.parse(jsonResp);

              if (jsonResp.result == "PROCESSING") {
                // if (jsonResp.state == "textsearch") {
                //   step1.style.fontWeight = "bold";
                //   spinner2.style.display = "none";
                //   spinner3.style.display = "none";
                // } else if (jsonResp.state == "imagesearch") {
                //   step1.style.color = "#4CAF50";
                //   step1.style.fontWeight = "bold";
                //   step2.style.fontWeight = "bold";
                //   spinner2.style.display = "inline-block";
                //   spinner3.style.display = "none";
                //   spinner1.className = "checkmark";
                // } else {
                //   step1.style.color = "#4CAF50";
                //   step2.style.color = "#4CAF50";
                //   step1.style.fontWeight = "bold";
                //   step2.style.fontWeight = "bold";
                //   step3.style.fontWeight = "bold";
                //   spinner1.className = "checkmark";
                //   spinner2.className = "checkmark";
                //   spinner3.style.display = "inline-block";
                // }
              } else {
                progressdiv.style.display = "none";
                updatestatebutton.style.display = "none";
                updateContent();
                clearInterval(intervalId);
                // phishinglist.style.height = "255px";
              }
            });
        })
        .catch((err) => {
          // An error occured. This can be the timeout, or some other error.
          console.log(err);
        });
    }

    function ackPhish(evt) {
      urlkey1 = evt.currentTarget.url;
      chrome.storage.local.get(
        {
          urlCacheIds: [],
        },
        function (result) {
          var i;
          for (i = 0; i < result.urlCacheIds.length; i++) {
            if (result.urlCacheIds[i].urlId == urlkey1) {
              result.urlCacheIds[i].ack = true;

              chrome.storage.local.set(
                {
                  urlCacheIds: result.urlCacheIds,
                },
                function (result) {
                  updateContent();
                  updateBadge();
                }
              );
              break;
            }
          }
        }
      );
    }

    function whitelistPhish(evt) {
      urlkey1 = evt.currentTarget.url;
      chrome.storage.local.get(
        {
          urlCacheIds: [],
        },
        function (result) {
          var i;
          for (i = 0; i < result.urlCacheIds.length; i++) {
            if (result.urlCacheIds[i].urlId == urlkey1) {
              result.urlCacheIds[i].result = "LEGITIMATE";

              chrome.storage.local.set(
                {
                  urlCacheIds: result.urlCacheIds,
                },
                function (result) {
                  updateContent();
                  updateBadge();
                }
              );
              break;
            }
          }
        }
      );
    }

    function updateBadge() {
      chrome.storage.local.get(
        {
          urlCacheIds: [],
        },
        function (result) {
          var count = 0;
          for (i = 0; i < result.urlCacheIds.length; i++) {
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
  }
);
