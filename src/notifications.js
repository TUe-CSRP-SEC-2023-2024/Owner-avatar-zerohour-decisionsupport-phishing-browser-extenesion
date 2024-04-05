import { storeNotificationSettings } from './storage.js';

const methods = ["password-input-block", "password-input-warning", "phishing-alert", "phishing-popup", "processing-popup"];

Array.prototype.forEach.call(document.getElementsByClassName("settings-checkbox"), elem =>
  elem.addEventListener("change", updateSettings)
);

function updateSettings() {
  let settings = {};

  // Get which notification methods are enabled
  let enabled = [];
  methods.forEach(method => {
    let elem = document.getElementById(method + "-enabled");
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
