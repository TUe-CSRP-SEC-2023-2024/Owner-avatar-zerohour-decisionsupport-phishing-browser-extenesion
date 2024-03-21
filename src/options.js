import { setup, clearAllStorage, setHost } from "./storage.js";

chrome.tabs.query(
  {
    active: true,
    lastFocusedWindow: true,
  },
  (tabs) => {
    let serverIPField = document.getElementById("server-ip");
    let serverPortField = document.getElementById("server-port");
    let httpsCheckbox = document.getElementById("https-checkbox");
    let saveButton = document.getElementById("save-button");
    let deleteDataButton = document.getElementById("delete-data-button");

    loadLocalSettings(httpsCheckbox, serverIPField, serverPortField);
    getServerCapabilities();

    saveButton.addEventListener("click", () => {
      let http = httpsCheckbox.checked ? "https://" : "http://";
      let host = http + serverIPField.value + ":" + serverPortField.value;

      setHost(host);
    });

    deleteDataButton.addEventListener("click", () => {
      clearAllStorage();
      console.log("Data deleted successfully!");
      chrome.runtime.reload();
    });
  }
);

function loadLocalSettings(httpsCheckbox, serverIPField, serverPortField) {
  chrome.storage.local.get(["host"], function (result) {
    httpsCheckbox.checked = result.host.includes("https");
    serverIPField.value = result.host.split(":")[1].substring(2);
    serverPortField.value = result.host.split(":")[2];
  });
}

function getServerCapabilities() {
  chrome.storage.local.get(["host"], function (result) {
    fetch(result.host + "/api/v2/capabilities")
      .then((response) => response.json())
      .then((data) => {
        console.log(data.decision_strategies);
        console.log(data.detection_methods);
      });
  });
}
