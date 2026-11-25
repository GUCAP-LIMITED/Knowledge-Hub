/**
 * Formats user type / role strings for clean UI display.
 *
 * Transformations applied:
 * 1. Inserts spaces into CamelCase / PascalCase strings (e.g., "CamelCase" -> "Camel Case").
 * 2. Replaces single or multiple spaces, hyphens, and underscores with a single space.
 * 3. Trims leading and trailing whitespace.
 * 4. Normalizes all-caps words (>= 4 chars) to Title Case, preserving <= 3 letter acronyms (CRM, IT, HR).
 * 5. Ensures the starting letter of each word is capital.
 *
 * @param value The raw user type string (e.g., "BranchManager", "sales_team_leader", "SystemAdmin")
 * @returns Cleanly formatted display string (e.g., "Branch Manager", "Sales Team Leader", "System Admin")
 */
export function formatUserType(value?: string | null): string {
  if (value === undefined || value === null || typeof value !== 'string') {
    return '';
  }

  return (
    value
      // 1. Put space in "CamelCase" -> "Camel Case" (handles acronyms + PascalCase)
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .replace(/([a-z\d])([A-Z])/g, '$1 $2')
      // 2. Replace single or multi space / hyphen / underscore with a single space
      .replace(/[\s\-_]+/g, ' ')
      // 3. Trim starting and ending space
      .trim()
      // 4. Normalize ALL-CAPS words (>= 4 chars) to Title Case, preserving <= 3 letter acronyms (CRM, IT, HR)
      .replace(/\b([A-Z]{4,})\b/g, (w) => w.charAt(0) + w.slice(1).toLowerCase())
      // 5. Ensure each starting word is capital
      .replace(/\b([a-z])/g, (char) => char.toUpperCase())
  );
}
