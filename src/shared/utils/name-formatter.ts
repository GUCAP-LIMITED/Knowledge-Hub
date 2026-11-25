/**
 * Formats a user display name cleanly matching Leads formatting behavior.
 * Preserves multi-word names (e.g. "Irteja Ahmed"), normalizes spaces,
 * converts to Title Case, and falls back to cleaning email prefixes when necessary.
 */
export function formatDisplayName(name?: string | null): string {
  if (name === undefined || name === null || name.trim().length === 0) {
    return 'Guest';
  }

  // Remove multiple spaces with a single space
  let formatted = name.trim().replace(/\s+/g, ' ');

  // If input contains an email address (fallback), strip domain
  if (formatted.includes('@')) {
    formatted = formatted.split('@')[0] ?? formatted;
  }

  // Replace dot/underscore delimiters with spaces
  formatted = formatted.replace(/[._]+/g, ' ').trim();

  if (formatted.length === 0) {
    return 'Guest';
  }

  // Convert to lowercase before title-casing each word
  formatted = formatted.toLowerCase();

  // Capitalize first letter and any letter following a space or non-alphabet char
  return formatted.replace(/(?:^|[^a-z])([a-z])/g, (match) => match.toUpperCase());
}
