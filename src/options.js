chrome.tabs.query(
  {
    active: true,
    lastFocusedWindow: true,
  },
  (tabs) => {
    let settingsButton = document.getElementById("settings-button");
    let aboutButton = document.getElementById("about-button");

    settingsButton.addEventListener("click", () => {
      loadContent("settings");
    });
    aboutButton.addEventListener("click", () => {
      loadContent("about");
    });
  }
);

// Loads the content of the tab based on the name of the HTML file
function loadContent(contentName) {
  let contentURL = contentName;

  if (!contentURL.includes(".html")) {
    contentURL = contentURL + ".html";
  }

  fetch(contentURL, { method: "GET" })
    .then((res) => {
      console.log(res);
      return res.text();
    })
    .then((data) => {
      document.getElementById("content").innerHTML = data;
      // Update the URL based on the current tab
      window.location.hash = contentName;
    })
    .catch((error) => {
      console.error(
        "There was en error trying to load the content dynamically. ",
        error
      );
    });
}

// This function loads the content based on the hash(#) value in the URL
function loadContentFromHash() {
  var hash = window.location.hash.substring(1);
  if (hash) {
    loadContent(hash);
  } else {
    loadContent("settings", "settings.html"); // Main content
  }
}

// This function is called when the page is loaded
window.onload = function () {
  // Load the content based on the hash(#) value
  loadContentFromHash();
};

// This event is called when the hash(#) value of the URL changes
window.addEventListener("hashchange", loadContentFromHash);
