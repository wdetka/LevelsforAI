// scripts/region-config.js
import { MODULE_ID, FLAGS } from "./constants.js";

export class TransitionRegionConfig extends foundry.applications.sheets.RegionConfig {
  // ------------------------------------------------------------
  // 1. Define the new tab
  // ------------------------------------------------------------
  static TABS = {
    sheet: {
      tabs: [
        { id: "basic", icon: "fa-solid fa-sliders" },        // built‑in
        { id: "behaviors", icon: "fa-solid fa-microchip" },  // built‑in
        { id: "transition", icon: "fa-solid fa-stairs" }     // our new tab
      ],
      initial: "basic",
      labelPrefix: "REGION.TABS"
    }
  };

  // ------------------------------------------------------------
  // 2. Define the content for the new tab
  // ------------------------------------------------------------
  static PARTS = {
    // Inherit all parts from the parent (basic, behaviors, footer, etc.)
    // We only need to add our new "transition" part.
    transition: {
      template: `modules/${MODULE_ID}/templates/transition-config.hbs`
    }
  };

  // ------------------------------------------------------------
  // 3. Prepare data for the template
  // ------------------------------------------------------------
  async _preparePartContext(partId, context, options) {
    // First, let the parent prepare its own data
    context = await super._preparePartContext(partId, context, options);

    // If we are preparing the "transition" part, add our flags
    if (partId === "transition") {
      const flags = this.document.flags[MODULE_ID] || {};
      const allRegions = this.document.parent.regions
        .filter(r => r.id !== this.document.id)
        .map(r => ({ id: r.id, name: r.name || r.id }));

      context.transition = {
        enabled: flags[FLAGS.ENABLED] ?? false,
        destinationRegionId: flags[FLAGS.DESTINATION_REGION_ID] || "",
        exitDistance: flags[FLAGS.EXIT_DISTANCE] ?? 2,
        confirm: flags[FLAGS.CONFIRM] ?? true,
        elevation: flags[FLAGS.ELEVATION] ?? 0,
        allRegions
      };

      // Also pass the module ID and flag names so the template can build field names
      context.moduleId = MODULE_ID;
      context.flags = FLAGS;
    }

    return context;
  }

  // ------------------------------------------------------------
  // 4. Handle saving the flags when the sheet is submitted
  // ------------------------------------------------------------
  async _updateObject(event, formData) {
    // formData is a FormDataExtended object
    // Extract our transition flags from the submitted data
    const transitionData = formData.object[`flags.${MODULE_ID}`] || {};

    // Build an update object with only our flags
    const updateData = {};
    if (transitionData[FLAGS.ENABLED] !== undefined) {
      updateData[`flags.${MODULE_ID}.${FLAGS.ENABLED}`] = transitionData[FLAGS.ENABLED];
    }
    if (transitionData[FLAGS.DESTINATION_REGION_ID] !== undefined) {
      updateData[`flags.${MODULE_ID}.${FLAGS.DESTINATION_REGION_ID}`] = transitionData[FLAGS.DESTINATION_REGION_ID];
    }
    if (transitionData[FLAGS.EXIT_DISTANCE] !== undefined) {
      updateData[`flags.${MODULE_ID}.${FLAGS.EXIT_DISTANCE}`] = transitionData[FLAGS.EXIT_DISTANCE];
    }
    if (transitionData[FLAGS.CONFIRM] !== undefined) {
      updateData[`flags.${MODULE_ID}.${FLAGS.CONFIRM}`] = transitionData[FLAGS.CONFIRM];
    }
    if (transitionData[FLAGS.ELEVATION] !== undefined) {
      updateData[`flags.${MODULE_ID}.${FLAGS.ELEVATION}`] = transitionData[FLAGS.ELEVATION];
    }

    // Apply those updates to the region document
    if (Object.keys(updateData).length) {
      await this.document.update(updateData);
    }

    // Let the parent handle the rest (other fields and built‑in tabs)
    await super._updateObject(event, formData);
  }
}