import { setHost, getHost } from "./storage.js";

let serverIPField = document.getElementById("server-ip");
let serverPortField = document.getElementById("server-port");
let httpsCheckbox = document.getElementById("https-checkbox");
let saveButton = document.getElementById("save-button");
let connectionStatus = document.getElementById("connection-status");
let connectionStatusCircle = document.getElementById("connection-status-circle");

loadLocalSettings();

saveButton.addEventListener("click", async () => {
  let http = httpsCheckbox.checked ? "https://" : "http://";
  let host = http + serverIPField.value + ":" + serverPortField.value;

  await setHost(host);
  await tryConnection();
});

async function loadLocalSettings() {
  const host = await getHost();
  const url = new URL(host);

  httpsCheckbox.checked = url.protocol === 'https';
  serverIPField.value = url.hostname;
  serverPortField.value = url.port;

  tryConnection();
}

async function tryConnection() {
  checking();

  const host = await getHost();

  try {
    const res = await fetch(host);

    if (res.ok) {
      connected();
    } else {
      disconnected();
    }
  } catch (e) {
    disconnected();
  }
}

function checking() {
  connectionStatus.classList.remove("connected", "disconnected");
  connectionStatus.innerHTML = "Checking";
  connectionStatus.classList.add("checking");

  connectionStatusCircle.classList.remove("connected", "disconnected");
  connectionStatusCircle.classList.add("checking");
}

function connected() {
  connectionStatus.classList.remove("checking", "disconnected");
  connectionStatus.innerHTML = "Connected";
  connectionStatus.classList.add("connected");

  connectionStatusCircle.classList.remove("checking", "disconnected");
  connectionStatusCircle.classList.add("connected");
}

function disconnected() {
  connectionStatus.classList.remove("checked", "disconnected");
  connectionStatus.innerHTML = "Disconnected";
  connectionStatus.classList.add("disconnected");

  connectionStatusCircle.classList.remove("checking", "connected");
  connectionStatusCircle.classList.add("disconnected");
}
