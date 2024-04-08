/**
 * A full-screen popup informing the user that this website was detected as phishing.
 */
class PhishingScreen extends NotificationMethod {
  async onStateChange(oldState, newState) {
    if (newState == PHISHING) {
      await this.display();
    } else {
      this.hide();
    }
  }

  async display() {
    let html = await fetchHTML('phishing_warning.html');
    document.body.appendChild(parseHTML(html, 'antiphishingpopup'));

    // Attach whitelist button handler
    document
      .getElementById("whitelistwarning")
      .addEventListener("click", this.addPageToWhitelist);

    // Attach ignore warning button handler
    document.querySelectorAll(".removephishingpopup").forEach(element => {
      element.addEventListener("click", this.hide);
    });
  }

  hide() {
    let elem = document.getElementById('antiphishingpopup');
    if (elem) {
      elem.remove();
    }
  }

  /**
   * Adds current page to whitelist.
   */
  addPageToWhitelist() {
    chrome.runtime.sendMessage({
      type: "WHITELIST_PAGE",
      url: location.href
    })
  }
}