import { MODULE_ID } from "./constants.js";

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "debug", {
    name: "Debug Mode",
    scope: "client",
    config: true,
    type: Boolean,
    default: false
  });
});