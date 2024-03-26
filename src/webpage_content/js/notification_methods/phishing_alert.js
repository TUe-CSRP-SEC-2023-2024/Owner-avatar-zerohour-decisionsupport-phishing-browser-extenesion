class PhishingAlert extends NotificationMethod {
  onStateChange(oldState, newState) {
    if (newState == PHISHING) {
      alert("Phishing Page Detected!\n\nWe recommend you proceed with extreme caution!");
    }
  }
}