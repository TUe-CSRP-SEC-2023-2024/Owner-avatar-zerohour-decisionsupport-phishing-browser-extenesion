class Alert extends NotificationMethod {
  state;

  texts = {
    PHISHING: "Phishing Page Detected!\n\nWe recommend you proceed with extreme caution!",
    PROCESSING: "This page is being processed!\n\nPlease be patient while we make sure that this is not a phishing page.",
    LEGITIMATE: "This webpage is legitimate!",
    INCONCLUSIVE: "We are not sure about the legitimacy webpage, stay alert!"
  };

  constructor(state, settings) {
    super();
    this.state = state;
  }

  async onStateChange(oldState, newState) {
    if (newState == this.state) {
      alert(this.texts[this.state]);
    }
  }
}