import { MODULE_ID, FLAGS } from "./constants.js";

/**
 * Handles the transition when a token enters a region.
 * @param {Token} token - The token that entered.
 * @param {Region} region - The region that was entered.
 */
export async function handleTokenEnterTransition(token, region) {
  const flags = region.flags[MODULE_ID] || {};
  if (!flags[FLAGS.ENABLED]) return;

  const destRegionId = flags[FLAGS.DESTINATION_REGION_ID];
  if (!destRegionId) {
    console.warn(`Region Transitions | Region "${region.name}" has no destination set.`);
    return;
  }

  const destinationRegion = region.parent.regions.get(destRegionId);
  if (!destinationRegion) {
    console.warn(`Region Transitions | Destination region with ID "${destRegionId}" not found.`);
    // Notify GM only
    if (game.user.isGM) {
      ui.notifications.warn(`Transition destination not found for region "${region.name}".`);
    }
    return;
  }

  // Check if we need confirmation
  const confirm = flags[FLAGS.CONFIRM] ?? true;
  const elevation = flags[FLAGS.ELEVATION] ?? 0;
  const exitDistance = flags[FLAGS.EXIT_DISTANCE] ?? 2;

  // If confirmation is required, show modal dialog
  let confirmed = true;
  if (confirm) {
    confirmed = await showConfirmationDialog(token, destinationRegion);
    if (!confirmed) return; // user cancelled
  }

  // Execute the transition
  await performTransition(token, destinationRegion, exitDistance, elevation);
}

/**
 * Shows a modal confirmation dialog.
 * @param {Token} token - The token being moved.
 * @param {Region} destinationRegion - The destination region.
 * @returns {Promise<boolean>} - True if confirmed, false if cancelled.
 */
function showConfirmationDialog(token, destinationRegion) {
  return new Promise((resolve) => {
    const dialog = new foundry.applications.api.DialogV2({
      window: {
        title: "Transition",
        icon: '<i class="fas fa-stairs"></i>',
        modal: true // blocks all UI interactions until resolved
      },
      content: `<p>Do you want to go to <strong>${destinationRegion.name}</strong>?</p>`,
      buttons: [
        {
          label: "Yes",
          icon: '<i class="fas fa-check"></i>',
          callback: () => resolve(true)
        },
        {
          label: "No",
          icon: '<i class="fas fa-times"></i>',
          callback: () => resolve(false)
        }
      ]
    });
    dialog.render(true);
  });
}

/**
 * Performs the actual teleport and elevation change.
 * @param {Token} token - The token to move.
 * @param {Region} destRegion - The destination region.
 * @param {number} exitDistance - Offset in grid units from the region center.
 * @param {number} elevation - The new elevation value.
 */
async function performTransition(token, destRegion, exitDistance, elevation) {
  // Mark token as transitioning to prevent recursion
  await token.document.setFlag(MODULE_ID, "isTransitioning", true);

  try {
    // Compute destination point: center of destination region + offset in the token's last movement direction
    const destCenter = destRegion.center;
    // Get token's movement direction from its last move (if we stored it)
    // We'll use the token's current facing or previous position difference
    // For simplicity, we'll use the token's last move delta if available; otherwise, use region's rotation (0 = north)
    // Better: capture movement direction when token entered the region (but we didn't store that)
    // We'll approximate by using the token's current facing? Or just use a default (south).
    // To make it more robust, we can store the entry direction in a flag when we detect entry.
    // For now, we'll use the direction from the token's previous position to current position (if available).
    // We can get that from the update data, but we don't have it here.
    // Fallback: use the region's rotation to determine exit direction.
    // Region rotation is in degrees; we assume 0 = up (north), 90 = right (east), etc.
    // We'll convert rotation to a vector.
    const angle = destRegion.rotation * Math.PI / 180;
    const dx = Math.sin(angle);
    const dy = -Math.cos(angle); // because Foundry y is down
    const gridSize = canvas.scene.grid.size;
    const offsetX = dx * exitDistance * gridSize;
    const offsetY = dy * exitDistance * gridSize;

    const newX = destCenter.x + offsetX;
    const newY = destCenter.y + offsetY;

    // Update token position
    await token.document.update({
      x: newX,
      y: newY
    });

    // Update elevation via Levels (if installed)
    if (game.modules.get("levels")?.active) {
      const levelsApi = game.modules.get("levels")?.api;
      if (levelsApi && typeof levelsApi.setElevation === "function") {
        await levelsApi.setElevation(token.document, elevation);
      } else {
        // Fallback: set flag directly
        await token.document.setFlag("levels", "elevation", elevation);
      }
    } else {
      // If Levels not present, store elevation in our own flag
      await token.document.setFlag(MODULE_ID, "elevation", elevation);
    }

    // Optionally, play a sound or effect here

  } finally {
    // Clear transitioning flag
    await token.document.unsetFlag(MODULE_ID, "isTransitioning");
  }
}