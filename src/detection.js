import { getHost } from 'storage.js';

// Elements for detection methods and decision strategy list
let detectionMethodSelect = document.getElementById("detection-method-select");
let decisionStrategySelect = document.getElementById("decision-strategy-select");

getServerCapabilities();

async function getServerCapabilities() {
  let host = await getHost();
  let res = await fetch(host + "/api/v2/capabilities");
  let data = await res.json();

  data.detection_methods.forEach(method => {
    let option = document.createElement("option");
    option.value = method;
    option.text = method;
    detectionMethodSelect.add(option);
  });

  data.decision_strategies.forEach((strategy) => {
    let option = document.createElement("option");
    option.value = strategy;
    option.text = strategy;
    decisionStrategySelect.add(option);
  });
}
