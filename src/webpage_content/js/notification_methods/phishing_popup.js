/**
 * A full-screen popup informing the user that this website was detected as phishing.
 */
class PhishingPopup {
  /**
   * Displays the popup.
   */
  static display() {
    if (document.getElementById("antiphishingpopup") == null) {
      fetchHTML('phishing_warning.html').then(html => {
        document.body.appendChild(parseHTML(html, 'antiphishingpopup'));

        // Attach whitelist button handler
        document
          .getElementById("whitelistwarning")
          .addEventListener("click", PhishingPopup.addPageToWhitelist);

        // Attach ignore warning button handler
        document.querySelectorAll(".removephishingpopup").forEach(element => {
          element.addEventListener("click", PhishingPopup.remove);
        })
      })
    }
  }

  /**
   * Removes the popup from the screen.
   */
  static remove() {
    let elem = document.getElementById('antiphishingpopup');
    if (elem) {
      elem.remove();
    }
  }

  /**
   * Adds current page to whitelist.
   */
  static addPageToWhitelist() {
    // TODO move to service or the like
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
}