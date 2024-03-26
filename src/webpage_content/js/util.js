/**
 * Gets the URL to a HTML file.
 * 
 * @param {string} file the relative HTML file path (including .html).
 * @returns the absolute URL to the HTML file.
 */
function getHTMLURL(file) {
  return chrome.runtime.getURL("webpage_content/html/" + file);
}

/**
 * Fetches the HTML text from the given file.
 * 
 * @param {string} file the file in `webpage_content/html/` directory.
 * @returns a Promise of the HTML text.
 */
async function fetchHTML(file) {
  let url = getHTMLURL(file);

  let res = await fetch(url);
  return await res.text();
}

/**
 * Parses the given text as an HTML Element.
 * 
 * @param {string} html the HTML text.
 * @param {string} id the ID to give to the main div.
 * @returns the Element.
 */
function parseHTML(html, id = null) {
  let div = document.createElement("div");
  if (id) {
    div.id = id;
  }

  div.innerHTML = html;
  return div;
}

/**
 * Gets a list of the password field elements on the page.
 * 
 * @returns the password field elements.
 */
function getPasswordFields() {
  return document.querySelectorAll("input[type=password]");
}

/**
 * Checks if the document is a login page.
 * 
 * @returns a boolean.
 */
function isLoginPage() {
  let password_fields = getPasswordFields();

  return password_fields.length !== 0;
}
