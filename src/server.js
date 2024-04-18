import { fetchApi } from "./util.js";

// Elements for detection methods and decision strategy list
let noConnection = document.getElementById("no-connection");
let detectionSettings = document.getElementById("detection-settings");
let decisionStrategyMajority = document.getElementById(
  "decision-strategy-majority"
);
let decisionStrategyUnanimous = document.getElementById(
  "decision-strategy-unanimous"
);
let decisionStrategyStrict = document.getElementById(
  "decision-strategy-strict"
);

let dstDetectionMethod = document.getElementById("detection-method-dst");
let dstDetectionMethodCheckbox = document.getElementById(
  "detection-method-dst-checkbox"
);
let dstDetectionMethodDetails = document.getElementById(
  "detection-method-dst-details"
);
let dstDetectionMethodHomebrew = document.getElementById(
  "detection-method-dst-homebrew"
);
let dstDetectionMethodGCV = document.getElementById("detection-method-dst-gcv");
let dstDetectionMethodTextSearchResults = document.getElementById(
  "detection-method-dst-text-search-results"
);
let dstDetectionMethodEMD1 = document.getElementById(
  "detection-method-dst-emd1"
);
let dstDetectionMethodEMD2 = document.getElementById(
  "detection-method-dst-emd2"
);
let dstDetectionMethodSSIM1 = document.getElementById(
  "detection-method-dst-ssim1"
);
let dstDetectionMethodSSIM2 = document.getElementById(
  "detection-method-dst-ssim2"
);

let randomDetectionMethod = document.getElementById("detection-method-random");
let randomDetectionMethodCheckbox = document.getElementById(
  "detection-method-random-checkbox"
);
let randomDetectionMethodDetails = document.getElementById(
  "detection-method-random-details"
);
let randomDetectionMethodSeed = document.getElementById(
  "detection-method-random-seed"
);

let cacheCheckbox = document.getElementById("checkbox-cache");

let saveButton = document.getElementById("save-button");

let strategies = new Map();
strategies.set("majority", decisionStrategyMajority);
strategies.set("unanimous", decisionStrategyUnanimous);
strategies.set("strict", decisionStrategyStrict);

let methods = new Map();
methods.set("dst", [
  dstDetectionMethod,
  dstDetectionMethodCheckbox,
  dstDetectionMethodDetails,
]);
methods.set("random", [
  randomDetectionMethod,
  randomDetectionMethodCheckbox,
  randomDetectionMethodDetails,
]);

let logoFinders = new Map();
logoFinders.set("homebrew", dstDetectionMethodHomebrew);
logoFinders.set("gcv", dstDetectionMethodGCV);

let capabilities;

try {
  capabilities = await fetchApi("/capabilities");
  await getSettings();

  detectionSettings.hidden = false;

  methods.forEach((method) => {
    method[1].addEventListener("change", () => {
      method[2].hidden = !method[1].checked;
    });
  });

  saveButton.addEventListener("click", async () => {
    saveSettings();
  });

  showStrategies();
  showMethods();
} catch (error) {
  noConnection.hidden = false;
  console.error(error);
}

// Function that loads the decision strategies based on the capabilities
function showStrategies() {
  let index = 0;

  capabilities.decision_strategies.forEach((strategy) => {
    strategies.get(strategy).disabled = false;
    index++;
  });
}

// Function that loads the detection methods based on the capabilities
function showMethods() {
  let index = 0;

  capabilities.detection_methods.forEach((method) => {
    methods.get(method)[0].hidden = false;
    methods.get(method)[1].disabled = false;
    index++;
  });
}

// Function that gets the settings from the server
async function getSettings() {
  let settings = await fetchApi("/settings");

  strategies.get(settings.decision_strategy).checked = true;

  settings.detection_methods.forEach((method) => {
    methods.get(method)[1].checked = true;
    methods.get(method)[2].hidden = false;
  });

  if (settings.dst != null) {
    logoFinders.get(settings.dst.logo_finder).checked = true;
    dstDetectionMethodTextSearchResults.value = settings.dst.text_search_results;
    dstDetectionMethodEMD1.value = settings.dst.emd_1;
    dstDetectionMethodEMD2.value = settings.dst.emd_2;
    dstDetectionMethodSSIM1.value = settings.dst.s_sim_1;
    dstDetectionMethodSSIM2.value = settings.dst.s_sim_2;
  }

  randomDetectionMethodSeed.value = settings.random.seed;

  cacheCheckbox.checked = settings.bypass_cache;

  return settings;
}

// Function that saves the settings to the server
async function saveSettings() {
  let decision_strategy = null;

  strategies.forEach((strategy, key) => {
    if (strategy.checked) {
      decision_strategy = key;
    }
  });

  let detection_methods = [];
  methods.forEach((method, key) => {
    if (method[1].checked) {
      detection_methods.push(key);
    }
  });

  let logo_finder = null;
  logoFinders.forEach((logoFinder, key) => {
    if (logoFinder.checked) {
      logo_finder = key;
    }
  });

  console.log({
    bypass_cache: cacheCheckbox.checked,
    decision_strategy: decision_strategy,
    detection_methods: detection_methods,
    dst: {
      logo_finder: logo_finder,
      text_search_results: dstDetectionMethodTextSearchResults.value,
      emd_1: dstDetectionMethodEMD1.value,
      emd_2: dstDetectionMethodEMD2.value,
      s_sim_1: dstDetectionMethodSSIM1.value,
      s_sim_2: dstDetectionMethodSSIM2.value,
    },
    random: {
      seed: randomDetectionMethodSeed.value,
    },
  });

  await fetchApi("/settings", "POST", {
    bypass_cache: cacheCheckbox.checked,
    decision_strategy: decision_strategy,
    detection_methods: detection_methods,
    dst: {
      logo_finder: logo_finder,
    },
    random: {
      seed: randomDetectionMethodSeed.value,
    },
  });
}
