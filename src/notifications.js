Array.prototype.forEach.call(document.getElementsByClassName("settings-checkbox"), elem =>
  elem.addEventListener("change", updateSettings)
);

function updateSettings() {
  console.log("Updating settings");
}
