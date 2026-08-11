// scripts/hooks.js
import { MODULE_ID, FLAGS } from "./constants.js";

// ============================================================
// Inject Transition settings into the Region config sheet
// (Inside the Behaviors tab)
// ============================================================
Hooks.on("renderRegionConfig", (app, html, data) => {
  if (!game.user.isGM) return;
  if (html.querySelector('[data-region-transitions]')) return;

  const flags = app.document.flags[MODULE_ID] || {};
  const enabled = flags[FLAGS.ENABLED] ?? false;
  const destRegionId = flags[FLAGS.DESTINATION_REGION_ID] || "";
  const exitDistance = flags[FLAGS.EXIT_DISTANCE] ?? 2;
  const confirm = flags[FLAGS.CONFIRM] ?? true;
  const elevation = flags[FLAGS.ELEVATION] ?? 0;

  const allRegions = app.document.parent.regions
    .filter(r => r.id !== app.document.id)
    .map(r => ({ id: r.id, name: r.name || r.id }));

  // Build the HTML for our settings
  const htmlContent = `
  <div data-region-transitions style="margin-top: 12px; padding: 8px; border-top: 1px solid #444;">
    <h4 style="margin: 0 0 8px 0; font-size: 14px;">
      <i class="fas fa-stairs"></i> Transition Settings
    </h4>

    <div class="form-group" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
      <label style="flex: 0 0 auto;">Enable Transition</label>
      <input type="checkbox" name="flags.${MODULE_ID}.${FLAGS.ENABLED}" ${enabled ? 'checked' : ''} style="flex: 0 0 auto;">
      <span class="hint" style="margin-left: 8px;">When a token enters this region, trigger a transition.</span>
    </div>

    <div class="form-group" style="margin-bottom: 8px;">
      <label>Destination Region</label>
      <select name="flags.${MODULE_ID}.${FLAGS.DESTINATION_REGION_ID}">
        <option value="">— None —</option>
        ${allRegions.map(r => 
          `<option value="${r.id}" ${r.id === destRegionId ? 'selected' : ''}>${r.name}</option>`
        ).join('')}
      </select>
      <p class="hint">The region where tokens will be teleported.</p>
    </div>

    <div class="form-group" style="margin-bottom: 8px;">
      <label>Exit Distance (grid units)</label>
      <input type="number" name="flags.${MODULE_ID}.${FLAGS.EXIT_DISTANCE}" 
             value="${exitDistance}" step="1" min="0" style="width: 60px;">
      <p class="hint">How far beyond the destination region the token should appear.</p>
    </div>

    <div class="form-group" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
      <label style="flex: 0 0 auto;">Ask Confirmation</label>
      <input type="checkbox" name="flags.${MODULE_ID}.${FLAGS.CONFIRM}" ${confirm ? 'checked' : ''} style="flex: 0 0 auto;">
      <span class="hint" style="margin-left: 8px;">If unchecked, transition happens instantly.</span>
    </div>

    <div class="form-group" style="margin-bottom: 8px;">
      <label>Elevation</label>
      <input type="number" name="flags.${MODULE_ID}.${FLAGS.ELEVATION}" 
             value="${elevation}" step="1" style="width: 60px;">
      <p class="hint">The elevation to set after transition (requires Levels module).</p>
    </div>
  </div>
  `;

  // Find the Behaviors tab content
  const behaviorsTab = html.querySelector('[data-tab="behaviors"]');
  
  if (behaviorsTab) {
    // Insert our settings inside the Behaviors tab
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    // Append after the existing content (or before the footer)
    behaviorsTab.appendChild(container.firstElementChild);
    console.log("Region Transitions | Settings injected into Behaviors tab.");
  } else {
    // Fallback: insert at the end of the form if Behaviors tab not found
    const form = html.querySelector('form');
    if (form) {
      const container = document.createElement('div');
      container.innerHTML = htmlContent;
      const footer = form.querySelector('.form-actions') || form.querySelector('.dialog-buttons');
      if (footer) {
        footer.before(container.firstElementChild);
      } else {
        form.appendChild(container.firstElementChild);
      }
      console.log("Region Transitions | Settings injected at end of form (fallback).");
    }
  }
});

// ============================================================
// Canvas Right-Click: Add "Configure Transition" to Region context menu
// ============================================================
Hooks.on("getRegionContextOptions", (region, options) => {
  options.push({
    name: "Configure Transition",
    icon: '<i class="fas fa-stairs"></i>',
    condition: () => true,
    callback: (region) => {
      // Open the Region config sheet
      region.document.sheet.render(true);
      // Optionally, we could switch to the Behaviors tab
      // But the user will see the injected settings there.
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
      entry.sheet.render(true);
    }
  });
});