console.log("Region Transitions | main.js loaded");

import "./settings.js";
import "./hooks.js";
import { TransitionRegionConfig } from "./region-config.js";

Hooks.once("init", () => {
  console.log("Region Transitions | init hook firing");
  CONFIG.Region.sheetClasses.base['core.RegionConfig'] = TransitionRegionConfig;
});

Hooks.once("ready", () => {
  console.log("Region Transitions | Module ready.");
});