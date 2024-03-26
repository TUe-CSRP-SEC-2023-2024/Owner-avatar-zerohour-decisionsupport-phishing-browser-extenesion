let detectionMethodSelect = document.getElementById("detection-method-select");
let decisionStrategySelect = document.getElementById(
  "decision-strategy-select"
);

getServerCapabilities();

function getServerCapabilities() {
  chrome.storage.local.get(["host"], function (res) {
    fetch(res.host + "/api/v2/capabilities")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        data.detection_methods.forEach((method) => {
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
      })
      .catch((error) => {
        console.error();
      });
  });
}
