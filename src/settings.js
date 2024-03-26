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
