/**
 * A warning above the password field telling the user that
 * the extension is still processing the webpage.
 */
class PasswordInputWarning extends NotificationMethod {
  password_fields;
  focus_only;

  constructor(settings) {
    super();
    this.focus_only = settings.focus_only;
  }

  setup() {
    this.password_fields = getPasswordFields();
    if (this.focus_only) {
      this.password_fields.forEach(password_field => {
        // Add focusin listener to password field
        password_field.addEventListener("focusin", () => {
          if (checkstatus === PROCESSING) {
            this.display();
          }
        });
      
        // Add focusout listener to password field
        password_field.addEventListener("focusout", () => {
          this.hide();
        });
      });
    }
  }

  async onStateChange(oldState, newState) {
    if (newState !== PROCESSING) {
      this.hide();
    } else if (!this.focus_only) {
      await this.display();
    }
  }

  async display() {
    let html = await fetchHTML('password_input_warning.html');
    this.password_fields.forEach(password_field => {
      // TODO find better way to only display on actually visible elements (e.g. stackoverflow with hidden password field bypasses this)
      // if (!password_field.checkVisibility()) {
      //   return;
      // }

      let elem = parseHTML(html);
      elem.classList.add('tooltipphish');
      document.body.appendChild(elem);
      
      let fieldProps = password_field.getBoundingClientRect();
      let tooltipProps = elem.firstChild.getBoundingClientRect();
      let topPos = fieldProps.top - tooltipProps.height;
      elem.firstChild.style.cssText += "left:" +
          fieldProps.left +
          "px;top:" +
          topPos +
          "px;";
      
      let firstChild = document.body.firstChild;
      document.body.insertBefore(elem, firstChild);
    });
  }

  hide() {
    let selector = document.querySelector(".tooltipphish");
    if (selector) {
      selector.remove();
    }
  }
}
