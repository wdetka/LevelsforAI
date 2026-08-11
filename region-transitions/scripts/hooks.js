// scripts/hooks.js
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
      // Open the Region config sheet – it will show the new "Transition" tab
      new TransitionRegionConfig(region.document).render(true);
    }
  });
});

// ============================================================
// (Optional) Sidebar Right-Click: Add to Region Directory list
// ============================================================
Hooks.on("getRegionDirectoryEntryContext", (entry, options) => {
  if (entry.documentName !== "Region") return;
  options.push({
    name: "Configure Transition",
    icon: '<i class="fas fa-stairs"></i>',
    condition: () => true,
    callback: () => {
      new TransitionRegionConfig(entry).render(true);
    }
  });
});