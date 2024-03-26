const { hostname } = new URL(location.href);

/**
 * The status of the current check.
 */
let checkstatus;
// Possible values:
const PROCESSING = "PROCESSING";
const INCONCLUSIVE = "INCONCLUSIVE";
const LEGITIMATE = "LEGITIMATE";
const PHISHING = "PHISHING";

window.addEventListener("focus", function () {
  checkPhishing();
});

// Wait for the page to have loaded before trying to count the password fields
window.addEventListener("load", function () {
  checkPhishing();
});

/**
 * Checks if the document is a login page.
 * 
 * @returns a boolean.
 */
function isLoginPage() {
  let password_fields = getPasswordFields();

  return password_fields.length !== 0;
}

let password_warns = new PasswordInputWarning();
let phishing_popup = new PhishingPopup();

/**
 * Runs a phishing check on the current page, if it's a login page.
 */
function checkPhishing() {
  if (checkstatus || !isLoginPage()) {
    return;
  }

  checkstatus = PROCESSING;

  password_warns.setup();
  phishing_popup.setup();

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

  let original_hostname = new URL(request.url).hostname;
  let current_hostname = new URL(location.href).hostname;
  if (original_hostname !== current_hostname) {
    return;
  }

  let prev_checkstatus = checkstatus;
  if (request.result !== "QUEUED") {
    checkstatus = request.result;
  }
  
  if (checkstatus != prev_checkstatus) {
    password_warns.onStateChange(prev_checkstatus, checkstatus);
    phishing_popup.onStateChange(prev_checkstatus, checkstatus);
  }

  // TODO: use as possible notification method:
  // alert("The anti-phishing browser extension has detected the page with URL: " + request.url + " as a phishing website. We recommend you proceed with exterme caution!");
});
