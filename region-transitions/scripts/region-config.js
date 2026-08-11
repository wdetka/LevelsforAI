// scripts/region-config.js
import { MODULE_ID, FLAGS } from "./constants.js";

console.log("Region Transitions | region-config.js loaded");

export class TransitionRegionConfig extends foundry.applications.sheets.RegionConfig {
  static TABS = {
    sheet: {
      tabs: [
        { id: "basic", icon: "fa-solid fa-sliders" },
        { id: "behaviors", icon: "fa-solid fa-microchip" },
        { id: "transition", icon: "fa-solid fa-stairs" }
      ],
      initial: "basic",
      labelPrefix: "REGION.TABS"
    }
  };

  static PARTS = {
    transition: {
      template: `modules/${MODULE_ID}/templates/transition-config.hbs`
    }
  };

  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
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
      context.moduleId = MODULE_ID;
      context.flags = FLAGS;
    }
    return context;
  }

  async _updateObject(event, formData) {
    const transitionData = formData.object[`flags.${MODULE_ID}`] || {};
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
    if (Object.keys(updateData).length) {
      await this.document.update(updateData);
    }
    await super._updateObject(event, formData);
  }
}