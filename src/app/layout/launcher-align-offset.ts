const VIEWPORT_EDGE_GUTTER_PX = 16;

/**
 * Radix `alignOffset` for an `align="end"` popover that should sit `VIEWPORT_EDGE_GUTTER_PX` from the
 * right viewport edge instead of flush with its trigger. For end alignment a negative offset moves the
 * panel toward the right edge, so the free space to the right of the trigger is returned negated.
 */
export const launcherAlignOffset = (
  triggerRight: number,
  viewportWidth: number,
): number => {
  const freeSpace = viewportWidth - triggerRight - VIEWPORT_EDGE_GUTTER_PX;
  return freeSpace > 0 ? -freeSpace : 0;
};
