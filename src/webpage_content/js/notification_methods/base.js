/**
 * A notification method for informing the user about changes in the phishing detection process.
 * 
 * For example, alerting the user that the website was detected as a phishing page,
 * or instructing the user not to enter their password while the detection tool is still running.
 */
class NotificationMethod {
  constructor() {
    if (this.constructor == NotificationMethod) {
      throw new Error("Abstract class NotificationMethod cannot be instantiated directly");
    }
  }

  /**
   * Called when a page is loaded and phishing detection just started.
   */
  setup() {
    // Default no behaviour
  }

  /**
   * Called when the phishing detection check status changes.
   * 
   * @param {string} oldState the previous state of the phishing check, see `checkstatus`.
   * @param {string} newState the new and current state of the phishing check, see `checkstatus`.
   */
  onStateChange(oldState, newState) {
    throw new Error("Abstract method onStateChange() not implemented")
  }
}
