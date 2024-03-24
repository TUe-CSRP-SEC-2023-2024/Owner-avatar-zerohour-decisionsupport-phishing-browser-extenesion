import { setup, setHost } from "./storage.js";

let serverIPField = document.getElementById("server-ip");
let serverPortField = document.getElementById("server-port");
let httpsCheckbox = document.getElementById("https-checkbox");
let saveButton = document.getElementById("save-button");
let connectionStatus = document.getElementById("connection-status");
let connectionStatusCircle = document.getElementById(
  "connection-status-circle"
);

loadLocalSettings();

saveButton.addEventListener("click", () => {
  let http = httpsCheckbox.checked ? "https://" : "http://";
  let host = http + serverIPField.value + ":" + serverPortField.value;

  setHost(host);
  tryConnection(host);
});

function loadLocalSettings() {
  chrome.storage.local.get(["host"], function (result) {
    httpsCheckbox.checked = result.host.includes("https");
    serverIPField.value = result.host.split(":")[1].substring(2);
    serverPortField.value = result.host.split(":")[2];

    let http = httpsCheckbox.checked ? "https://" : "http://";
    let host = http + serverIPField.value + ":" + serverPortField.value;

    tryConnection(host);
  });
}

function tryConnection(host) {

  checking();

  fetch(host)
    .then((res) => {
      if (res.ok) {
        connected();
      } else {
        disconnected();
      }
    })
    .catch((error) => {
      disconnected();
    });
}

function connected() {
  connectionStatus.classList.remove("checking", "disconnected");
  connectionStatus.innerHTML = "Connected";
  connectionStatus.classList.add("connected");

  connectionStatusCircle.classList.remove("checking", "disconnected");
  connectionStatusCircle.classList.add("connected");
}

function checking() {
  connectionStatus.classList.remove("connected", "disconnected");
  connectionStatus.innerHTML = "Checking";
  connectionStatus.classList.add("checking");

  connectionStatusCircle.classList.remove("connected", "disconnected");
  connectionStatusCircle.classList.add("checking");
}

function disconnected() {
  connectionStatus.classList.remove("checked", "disconnected");
  connectionStatus.innerHTML = "Disconnected";
  connectionStatus.classList.add("disconnected");

  connectionStatusCircle.classList.remove("checking", "connected");
  connectionStatusCircle.classList.add("disconnected");
}
