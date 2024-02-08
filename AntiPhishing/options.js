chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
}, tabs => {
    let deleteDataButton = document.getElementById('delete-data-button');

    deleteDataButton.addEventListener("click", () => {
        chrome.storage.local.clear();
        console.log("Deleted all local storage.")
    });
});