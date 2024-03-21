const { hostname } = new URL(location.href);

let checkstatus = "PROCESSING";

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

  return !hostname.includes("google.") &&
    !hostname.includes("chrome://") &&
    !hostname.includes("bit.ly") && // TODO: why URL
    hostname.includes(".") &&
    password_fields.length != 0
}


/**
 * Runs a phishing check on the current page, if it's a login page.
 */
function checkPhishing() {
  if (!isLoginPage()) {
    return;
  }

  checkstatus = "PROCESSING";

  // Send message to service to start phishing check
  chrome.runtime.sendMessage({
    url: chrome.runtime.url,
  });

  let password_fields = getPasswordFields();

  // Add warning messages to input fields
  for (let i = 0; i < password_fields.length; i++) {
    password_fields[i].addEventListener("focusin", () => {
      if (checkstatus == "PROCESSING") {
        // TODO extract this stuff to separate HTML file as much as possible (positioning probably not possible)

        // Create main div
        let tooltipDiv = document.createElement("div");
        tooltipDiv.className = "tooltipphish";

        // Add warning text to div
        let tooltipText = document.createElement("span");
        tooltipText.className = "tooltiptext";
        tooltipText.innerHTML =
          "CAUTION: do not enter your details! The anti-phishing plug-in is still running!";
        tooltipDiv.appendChild(tooltipText);

        // Position div near password field
        let padding = 30;
        let fieldProps = event.target.getBoundingClientRect();
        let tooltipProps = tooltipDiv.getBoundingClientRect();
        let topPos = fieldProps.top - (tooltipProps.height + padding);
        tooltipDiv.style.cssText =
          "left:" +
          fieldProps.left +
          "px;top:" +
          topPos +
          "px;position:absolute;z-index:100;background: #F4FF47;border-radius:6px;padding: 6px 12px;font-family: arial;font-size: 12px;text-shadow: 0px 1px 1px #000;color: #011a15;";

        // Add div to webpage
        let firstChild = document.body.firstChild;
        document.body.insertBefore(tooltipDiv, firstChild);
      }
    });

    // Remove added div when the password field loses focuss
    password_fields[i].addEventListener("focusout", () => {
      document.querySelector(".tooltipphish").remove();
    });
  }
}

/**
 * Listener for phishing check status updates.
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.result == "PHISHING") {
    // Update status
    checkstatus = "PHISHING";

    // Check if still on same domain, if yes then display warning
    let origin_hostname = new URL(request.url).hostname;
    let current_hostname = new URL(location.href).hostname;

    if (current_hostname == origin_hostname) {
      // TODO: use as possible notification method:
      // alert("The anti-phishing browser extension has detected the page with URL: " + request.url + " as a phishing website. We recommend you proceed with exterme caution!");

      if (document.getElementById("antiphishingpopup") == null) {
        // TODO: extract to separate HTML file
        let popup = document.createElement("div");
        popup.setAttribute("id", "antiphishingpopup");
        popup.innerHTML +=
          '<div style="padding: 10%;"><div style="width: 150px; float: left; margin-right: 20px;"><img style="width:100%;" src="https://upload.wikimedia.org/wikipedia/commons/8/81/Stop_sign.png" /></div><div style="float:left;"><h1 style="color:#fff; border-bottom: 1px solid white; font-size: xxx-large; margin:10px;padding:20px 10px; text-align:left;">Phishing Detected!</h1><p style="color:#fff;font-weight: bold;font-size: large;margin:10px;padding:20px 10px;text-align:left;">The website you are trying to visit has been reported a phishing site by your Anti-Phishing browser plugin.</p><p style="color:#fff;font-weight: bold;font-size: large;margin:10px;padding:20px 10px;text-align:left;">Phishing websites are designed to trick you into revealing personal or financial information by imitating sources your may trust.</p><p style="color:#fff;font-weight: bold;font-size: large;margin:10px;padding:20px 10px;text-align:left;">Entering any information on this web page may result in identity theft or other fraud.<br><br><br><br>Please close this window now.</p><br/><br/><button style="cursor:pointer;float:right;text-decoration:underline;background:none;color:#000;border:none;" onClick="document.getElementById(&quot;antiphishingpopup&quot;).style.display = &quot;none&quot;;">Ignore this warning</button><br/><button id="whitelistwarning" style="cursor:pointer;float:right;text-decoration:underline;background:none;color:#000;border:none;" onClick="document.getElementById(&quot;antiphishingpopup&quot;).style.display = &quot;none&quot;;">Whitelist this page</button></div></div>';
        popup.style.cssText =
          "position:fixed;top:0;left:0;width:100%;height:100%;z-index:2147483647;background:#772222;";
        document.body.appendChild(popup);
        
        document
          .getElementById("whitelistwarning")
          .addEventListener("click", () => {
            addPageToWhitelist();
          });
      }
    }
  } else if (request.result == "LEGITIMATE") {
    // Update status
    checkstatus = "LEGITIMATE";

    // Remove password field tooltip
    document.querySelector(".tooltipphish").remove();
  }
});

/**
 * Adds current page to whitelist.
 */
function addPageToWhitelist() {
  chrome.storage.local.get(
    {
      urlCacheIds: [],
    },
    function (result) {
      for (let i = 0; i < result.urlCacheIds.length; i++) {
        // Check if this is the current page
        if (result.urlCacheIds[i].urlId == location.href) {
          // Set it to legitimate and store the result
          result.urlCacheIds[i].result = "LEGITIMATE";

          chrome.storage.local.set(
            {
              urlCacheIds: result.urlCacheIds,
            },
            function (result) {}
          );
          break;
        }
      }
    }
  );
}