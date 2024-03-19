import { setup, clearAllStorage } from "./storage.js";

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

    saveButton.addEventListener("click", () => {
      let http = httpsCheckbox.checked ? "https://" : "http://";
      let host = http + serverIPField.value + ":" + serverPortField.value;

      chrome.storage.local.set(
        {
          host: host,
        },
        function () {
          console.log("Server host set to: " + host);
        }
      );
    });

    deleteDataButton.addEventListener("click", () => {
      clearAllStorage();
      console.log("Data deleted successfully!");
      chrome.runtime.reload();
      //setup();
    });
  }
);
