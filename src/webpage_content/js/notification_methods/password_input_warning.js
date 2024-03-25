/**
 * A warning above the password field telling the user that
 * the extension is still processing the webpage.
 */
class PasswordInputWarning {
  /**
   * Displays the warning on the given password field.
   * 
   * @param {Element} password_field the password field.
   */
  static display(password_field) {
    fetchHTML('password_input_warning.html').then(html => {
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

  /**
   * Remove the notification warnings from the current page.
   */
  static remove() {
    let selector = document.querySelector(".tooltipphish");
    if (selector) {
      selector.remove();
    }
  }

  /**
   * Adds listeners to the given password field to automatically display
   * the warning if needed.
   * 
   * @param {Element} password_field the password field to handle.
   */
  static handle_field(password_field) {
    password_field.addEventListener("focusin", () => {
      if (checkstatus === "PROCESSING") {
        PasswordInputWarning.display(password_field);
      }
    });
  
    password_field.addEventListener("focusout", () => {
      PasswordInputWarning.remove();
    });
  }
}
