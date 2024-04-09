import { clearStorage, clearCache } from "./storage.js";

let deleteDataButton = document.getElementById("delete-data-button");

deleteDataButton.addEventListener("click", async () => {
  await clearStorage();
  alert("Data deleted successfully!");
  chrome.runtime.reload();
});

let deleteCacheButton = document.getElementById("delete-cache-button");

deleteCacheButton.addEventListener("click", async () => {
  await clearCache();
  alert("Cache deleted successfully!");
});
