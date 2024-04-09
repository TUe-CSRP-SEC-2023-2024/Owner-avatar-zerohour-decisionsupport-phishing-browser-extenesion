import { storeNotificationSettings, getNotificationSettings } from './storage.js';

const methods = ["password-input-block", "password-input-warning", "phishing-alert", "phishing-screen", "processing-screen"];

Array.prototype.forEach.call(document.getElementsByClassName("settings-checkbox"), elem =>
  elem.addEventListener("change", updateSettings)
);

Array.prototype.forEach.call(document.getElementsByClassName("settings-input"), elem =>
  elem.disabled = true
);

function updateSettings() {
  let settings = {};

  // Get which notification methods are enabled
  let enabled = [];
  methods.forEach(method => {
    let elem = getEnabledCheckbox(method);
    let checked = elem.checked;

    if (checked) {
      enabled.push(method);
    }
  });
  settings["enabled"] = enabled;

  let method_settings = {};

  let password_input_warning = {};
  password_input_warning["focus-only"] = document.getElementById("password-input-warning-focus-only").checked;
  method_settings["password-input-warning"] = password_input_warning;

  settings["methods"] = method_settings;

  storeNotificationSettings(settings);

  console.log("Stored notification settings");
  console.log(settings);
}

async function loadSettings() {
  const settings = await getNotificationSettings();

  const enabled = settings["enabled"];
  const method_settings = settings["methods"];

  methods.forEach(method => {
    let elem = getEnabledCheckbox(method);
    elem.checked = enabled.includes(method);
  });

  const password_input_warning = method_settings["password-input-warning"];
  document.getElementById("password-input-warning-focus-only").checked = password_input_warning["focus-only"];
  
  Array.prototype.forEach.call(document.getElementsByClassName("settings-input"), elem =>
    elem.disabled = false
  );

  console.log("Loaded notification settings");
  console.log(settings);
}

function getEnabledCheckbox(method) {
  let elem = document.getElementById(method + "-enabled");
  if (!elem) {
    throw Error("could not find enabled checkbox for " + method);
  }
  return elem;
}

await loadSettings();
