import { setup, clearAllStorage, setHost } from "./storage.js";

chrome.tabs.query(
  {
    active: true,
    lastFocusedWindow: true,
  },
  (tabs) => {
    let deleteDataButton = document.getElementById("delete-data-button");

    deleteDataButton.addEventListener("click", () => {
      clearAllStorage();
      console.log("Data deleted successfully!");
      chrome.runtime.reload();
    });
  }
);

function getServerCapabilities() {
  chrome.storage.local.get(["host"], function (result) {
    fetch(result.host + "/api/v2/capabilities")
      .then((res) => res.json())
      .then((data) => {
        console.log(data.decision_strategies);
        console.log(data.detection_methods);
      })
      .catch((error) => {
        let serverCapabilities = document.getElementById("server-capabilities");
        serverCapabilities.innerHTML = "Error: " + error;
        console.error(
          "There was an error trying to get the server capabilities.",
          error
        );
      });
  });
}
