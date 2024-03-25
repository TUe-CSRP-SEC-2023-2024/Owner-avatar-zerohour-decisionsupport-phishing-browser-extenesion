// TODO: docs
class NotificationMethod {
  constructor() {
    if (this.constructor == NotificationMethod) {
      throw new Error("Abstract class NotificationMethod cannot be instantiated directly");
    }
  }

  setup() {
    // Default no behaviour
  }

  onStateChange(oldState, newState) {
    throw new Error("Abstract method onStateChange() not implemented")
  }
}
