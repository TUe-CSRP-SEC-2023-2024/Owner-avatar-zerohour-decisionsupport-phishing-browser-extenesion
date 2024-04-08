/**
 * Disable password field input during PROCESSING phase.
 */
class PasswordInputBlock extends NotificationMethod {
  async onStateChange(oldState, newState) {
    getPasswordFields().forEach(field => field.disabled = newState == PROCESSING);
  }
}
