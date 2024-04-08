/**
 * A full-screen popup informing the user that this website is being processed.
 */
class Processingscreen extends NotificationMethod {
  async onStateChange(oldState, newState) {
    if (newState == PROCESSING) {
      await this.display();
    } else {
      this.hide();
    }
  }

  async display() {
    // TODO find good way to isolate popup from webpage-defined style (e.g. iframe)
    let html = await fetchHTML('processing_page.html');
    document.body.appendChild(parseHTML(html, 'phishingprocessingpopup'));
  }

  hide() {
    let elem = document.getElementById('phishingprocessingpopup');
    if (elem) {
      elem.remove();
    }
  }
}