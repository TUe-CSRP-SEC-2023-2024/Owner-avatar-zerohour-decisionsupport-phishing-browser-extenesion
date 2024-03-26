const tabs = new Map();
tabs.set("settings", "Settings");
tabs.set("connection", "Connection");
tabs.set("detection", "Detection");
tabs.set("notifications", "Notifications");
tabs.set("about", "About");

let headerContent = document.getElementById("header-content");
let buttons = [];

tabs.forEach((name, id) => {
  let button = document.createElement("div");
  button.id = id + "-button";
  button.className = "header-button";
  button.innerHTML = name;
  button.addEventListener("click", () => {
    loadContent(id);
  });

  headerContent.appendChild(button);
  buttons.push(button);
});

// Loads the content of the tab based on the name of the HTML file
function loadContent(tab) {
  if (!tabs.has(tab)) {
    return;
  }

  //check if the tab has a script file and load it
  let iframe = document.getElementById("content");
  iframe.src = tab + ".html";

  let buttons = document.getElementsByClassName("header-button active");
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("active");
  }

  let button = document.getElementById(tab + "-button");
  button.classList.add("active");

  fetch(tab + ".html", { method: "GET" })
    .then((res) => {
      return res.text();
    })
    .then((data) => {
      document.getElementById("content").innerHTML = data;
      // Update the URL based on the current tab
      window.location.hash = tab;
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
  var tab = window.location.hash.substring(1);
  if (tabs.has(tab)) {
    loadContent(tab);
  } else {
    loadContent("settings"); // main tab
  }
}

// This function is called when the page is loaded
window.onload = function () {
  // Load the content based on the hash(#) value
  loadContentFromHash();
};

// This event is called when the hash(#) value of the URL changes
window.addEventListener("hashchange", loadContentFromHash);
