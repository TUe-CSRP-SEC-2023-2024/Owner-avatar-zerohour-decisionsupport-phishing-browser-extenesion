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
// notification_methods.push(new PasswordInputBlock());
// notification_methods.push(new PasswordInputWarning(false));
notification_methods.push(new PhishingPopup());
notification_methods.push(new ProcessingPopup());

/**
 * Runs a phishing check on the current page, if it's a login page.
 */
function checkPhishing() {
  if (checkstatus || !isLoginPage()) {
    return;
  }

  checkstatus = PROCESSING;

  // Setup notification methods and initialize them with PROCESSING state
  notification_methods.forEach(notification_method => notification_method.setup());
  notification_methods.forEach(notification_method => notification_method.onStateChange(undefined, PROCESSING));
  
  // Send message to service to start phishing check
  chrome.runtime.sendMessage({
    type: "CHECK_PHISHING",
    url: chrome.runtime.url,
  });
}

/**
 * Listener for phishing check status updates.
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
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
    notification_methods.forEach(notification_method => 
        notification_method.onStateChange(prev_checkstatus, checkstatus));
  }
});

// Do a phishing check when the page is loaded, or when switching to the page
window.addEventListener("focus", checkPhishing);
window.addEventListener("load", checkPhishing);
