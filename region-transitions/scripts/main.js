// scripts/main.js
import "./settings.js";
import "./hooks.js";
import "./constants.js";

Hooks.once("ready", () => {
  console.log("Region Transitions | Module ready.");
});