// scripts/main.js
import "./settings.js";
import "./hooks.js";
import { TransitionRegionConfig } from "./region-config.js";

Hooks.once("init", () => {
  // Override the default RegionConfig with our custom one
  CONFIG.Region.sheetClasses.base['core.RegionConfig'].cls = TransitionRegionConfig;
});

Hooks.once("ready", () => {
  console.log("Region Transitions | Module ready.");
});