/**
 * A full-screen popup informing the user that this website is being processed.
 */
class ProcessingPopup extends NotificationMethod {
  onStateChange(oldState, newState) {
    if (newState == PROCESSING) {
      this.display();
    } else {
      this.hide();
    }
  }

  display() {
    // TODO find good way to isolate popup from webpage-defined style (e.g. iframe)
    fetchHTML('processing_page.html').then(html => {
      document.body.appendChild(parseHTML(html, 'phishingprocessingpopup'));
    });
  }

  hide() {
    let elem = document.getElementById('phishingprocessingpopup');
    if (elem) {
      elem.remove();
    }
  }
}