import { getCacheResult, storeCacheResult, getAllPhishingCacheEntries, acknowledgePhishingPage } from '/storage.js';
import { getCheckState, getDefinitiveState, updateBadge } from '/util.js';

let tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

let url = tabs[0].url;
let currentUrl = document.getElementById("currUrl");
let rating = document.getElementById("rating");
let progressdiv = document.getElementById("progressdiv");
let settingsBtn = document.getElementById("settings-button");
let phishinglist = document.getElementById("phishinglist");

settingsBtn.addEventListener("click", () => chrome.runtime.openOptionsPage());

// Cut part of the URL if it's too long
let displayUrl = url;
if (url.length > 30) {
  displayUrl = url.slice(0, 30) + "...";
}
currentUrl.textContent = displayUrl;

updateContent();

// Get response from cache to display in the pop-up
async function updateContent() {
  const result = await getCacheResult(url);
  if (result) {
    if (result == "LEGITIMATE") {
      rating.textContent = "No, you're safe!";
    } else if (result == "PHISHING") {
      rating.textContent = "Yes, be careful!";
    } else if (result == "QUEUED" || result == "PROCESSING") {
      rating.textContent = "Waiting for result...";
      progressdiv.style.display = "block";
    } else if (result == "INCONCLUSIVE") {
      rating.textContent = "We're not sure about this one! Be alert!";
    }
  } else {
    rating.textContent = "This page has no password field and will not be checked.";
  }

  phishinglist.innerHTML = "";
  (await getAllPhishingCacheEntries()).forEach(cacheEntry => {
    const phishUrl = cacheEntry.urlId;

    // add to past phishing list
    document.getElementById("phishingtitle").style.display = "block";
    var div = document.createElement("div");
    div.className = "itemwrapper";
    div.innerHTML =
      '<div class="sitename"><span>' +
      phishUrl +
      '</span></div><div class="actions"><button id="ackbutton-' +
      i +
      '" class="actionbutton ackbutton">Dismiss</button><button id="whitelistbutton-' +
      i +
      '" class="actionbutton whitelistbutton">Whitelist</button></div>';
    phishinglist.appendChild(div);
    document.getElementById("ackbutton-" + i).url =
      phishUrl;
    document
      .getElementById("ackbutton-" + i)
      .addEventListener("click", ackPhish, false);
    document.getElementById("whitelistbutton-" + i).url =
      phishUrl;
    document
      .getElementById("whitelistbutton-" + i)
      .addEventListener("click", whitelistPhish, false);
  });
}

// When check done, remove progress div
getDefinitiveState(url).then(async _ => {
  progressdiv.style.display = "none";

  await updateContent();
});

async function ackPhish(evt) {
  const phishUrl = evt.currentTarget.url;

  await acknowledgePhishingPage(phishUrl);
}

async function whitelistPhish(evt) {
  const phishUrl = evt.currentTarget.url;

  await storeCacheResult(phishUrl, "LEGITIMATE");
  updateContent();
  updateBadge();
}
