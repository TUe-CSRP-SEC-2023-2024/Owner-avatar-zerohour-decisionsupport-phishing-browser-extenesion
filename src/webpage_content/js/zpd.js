const { hostname } = new URL(location.href);

/**
 * The status of the current check.
 */
let checkstatus;

window.addEventListener("focus", function () {
  checkPhishing();
});

// Wait for the page to have loaded before trying to count the password fields
window.addEventListener("load", function () {
  checkPhishing();
});

/**
 * Gets a list of the password field elements on the page.
 * 
 * @returns the password field elements.
 */
function getPasswordFields() {
  return document.querySelectorAll("input[type=password]");
}

/**
 * Checks if the document is a login page.
 * 
 * @returns a boolean.
 */
function isLoginPage() {
  let password_fields = getPasswordFields();

  return password_fields.length !== 0;
}

/**
 * Runs a phishing check on the current page, if it's a login page.
 */
function checkPhishing() {
  if (checkstatus || !isLoginPage()) {
    return;
  }

  checkstatus = "PROCESSING";

  // Send message to service to start phishing check
  chrome.runtime.sendMessage({
    type: "CHECK_PHISHING",
    url: chrome.runtime.url,
  });

  let password_fields = getPasswordFields();

  // Add warning messages to input fields
  for (let i = 0; i < password_fields.length; i++) {
    PasswordInputWarning.handle_field(password_fields[i]);
  }
}

/**
 * Listener for phishing check status updates.
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type !== "CHECK_STATUS") {
    return;
  }

  if (request.result !== "QUEUED") {
    checkstatus = request.result;
  }

  if (request.result === "PHISHING") {
    // Check if still on same domain
    let original_hostname = new URL(request.url).hostname;
    let current_hostname = new URL(location.href).hostname;

    if (current_hostname === original_hostname) {
      // TODO: use as possible notification method:
      // alert("The anti-phishing browser extension has detected the page with URL: " + request.url + " as a phishing website. We recommend you proceed with exterme caution!");

      PhishingPopup.display();
    }
  } else if (request.result === "LEGITIMATE") {
    // Remove password field tooltip
    PasswordInputWarning.remove();
  }
});
