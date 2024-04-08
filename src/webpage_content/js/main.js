/**
 * The status of the current check.
 */
let checkstatus;
// Possible values:
const PROCESSING = "PROCESSING";
const INCONCLUSIVE = "INCONCLUSIVE";
const LEGITIMATE = "LEGITIMATE";
const PHISHING = "PHISHING";

/**
 * The list of active notification methods.
 */
let notification_methods = [];

/**
 * Runs a phishing check on the current page, if it's a login page.
 */
async function checkPhishing() {
  if (checkstatus || !isLoginPage()) {
    return;
  }

  checkstatus = PROCESSING;

  // Setup notification methods and initialize them with PROCESSING state
  notification_methods.forEach(notification_method => notification_method.setup());
  
  // Send message to service to start phishing check
  chrome.runtime.sendMessage({
    type: "CHECK_PHISHING",
    url: chrome.runtime.url,
  });
}

/**
 * Listener for phishing check status updates.
 */
chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  if (request.type !== "CHECK_STATUS") {
    return;
  }

  // First, check if we're still on the same domain
  let original_hostname = new URL(request.url).hostname;
  let current_hostname = new URL(location.href).hostname;
  if (original_hostname !== current_hostname) {
    return;
  }

  // Then, check what the status has changed to and what it was
  let prev_checkstatus = checkstatus;
  if (request.result !== "QUEUED") {
    checkstatus = request.result;
  }

  // .. and if the status changed, notify the notification methods
  if (checkstatus != prev_checkstatus) {
    for (let method of notification_methods) {
      await method.onStateChange(prev_checkstatus, checkstatus);
    }
  }
});

async function load() {
  const all_notification_methods = {
    "password-input-block": args => new PasswordInputBlock(args),
    "password-input-warning": args => new PasswordInputWarning(args),
    "phishing-alert": args => new PhishingAlert(args),
    "phishing-screen": args => new PhishingScreen(args),
    "processing-screen": args => new ProcessingScreen(args)
  };

  const settings = await chrome.runtime.sendMessage({
    type: "REQUEST_NOTIFICATION_SETTINGS"
  });

  const enabled = settings["enabled"];
  // For each notification method, check if it's enabled and activite it with its settings
  Object.keys(all_notification_methods).forEach(method => {
    if (enabled.includes(method)) {
      let method_settings = {};
      if ("methods" in settings && method in settings["methods"]) {
        method_settings = settings["methods"][method];
      }

      const notification_method = all_notification_methods[method](method_settings);

      notification_methods.push(notification_method);
    }
  });

  // Do a phishing check when the page is loaded, or when switching to the page
  window.addEventListener("focus", checkPhishing);
  window.addEventListener("load", checkPhishing);
}

load();