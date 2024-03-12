import {setup, clearAllStorage} from './common.js';

chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
}, tabs => {
    let deleteDataButton = document.getElementById('delete-data-button');

    deleteDataButton.addEventListener("click", () => {
        clearAllStorage();
        setup();
        console.log("Data deleted successfully!");
    });
});