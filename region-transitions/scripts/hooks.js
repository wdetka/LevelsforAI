import { TransitionRegionConfig } from "./region-config.js";

// ============================================================
// Canvas Right-Click: Add "Configure Transition" to Region context menu
// ============================================================
Hooks.on("getRegionContextOptions", (region, options) => {
  options.push({
    name: "Configure Transition",
    icon: '<i class="fas fa-stairs"></i>',
    condition: () => true,
    callback: (region) => {
      // Open the Region config sheet and switch to the "transition" tab
      const config = new TransitionRegionConfig(region.document);
      config.render(true, { focus: true });
      // Optional: programmatically switch to the transition tab after render
      // (the sheet will remember the last active tab, but we can force it)
      // config._activateTab("transition");
    }
  });
});

// ============================================================
// (Optional) Sidebar Right-Click: Add to Region Directory list
// ============================================================
Hooks.on("getRegionDirectoryEntryContext", (entry, options) => {
  // Only for region documents, not folders
  if (entry.documentName !== "Region") return;

  options.push({
    name: "Configure Transition",
    icon: '<i class="fas fa-stairs"></i>',
    condition: () => true,
    callback: () => {
      // entry is a Region document
      const config = new TransitionRegionConfig(entry);
      config.render(true, { focus: true });
    }
  });
});