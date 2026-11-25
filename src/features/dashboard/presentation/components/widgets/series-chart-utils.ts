const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Calculates a reasonable maximum character budget per tick label based on the available axis width
 * and total number of ticks. Enforces a minimum of 3 characters.
 */
export function computeMaxChars(
  width?: number,
  tickCount?: number,
  fallback = 10,
): number {
  if (width !== undefined && width > 0 && tickCount !== undefined && tickCount > 0) {
    const slotWidth = width / tickCount;
    const budget = Math.floor((slotWidth - 6) / 6.5);
    return Math.max(3, budget);
  }
  return fallback;
}

/**
 * Formats a tick label: converts ISO date strings into localized short dates, or truncates long
 * labels with an ellipsis to strictly fit within `maxChars`.
 */
export function formatTickLabel(raw: string, maxChars = 10): string {
  if (ISO_DATE_RE.test(raw)) {
    const d = new Date(raw + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }
  if (raw.length <= maxChars) {
    return raw;
  }
  const sliceLen = Math.max(1, maxChars - 1);
  return `${raw.slice(0, sliceLen)}…`;
}
