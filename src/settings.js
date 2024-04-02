import { clearStorage } from "./storage.js";

chrome.tabs.query(
  {
    active: true,
    lastFocusedWindow: true,
  },
  (tabs) => {
    let deleteDataButton = document.getElementById("delete-data-button");

    deleteDataButton.addEventListener("click", () => {
      clearStorage();
      console.log("Data deleted successfully!");
      chrome.runtime.reload();
    });
  }
);
