/**
 * Validates whether a candidate string is a well-formed HTTP or HTTPS URL.
 * Rejects non-HTTP(S) protocols, relative paths, plain text, and malformed strings.
 */
export function isValidHttpUrl(candidate: string | null | undefined): boolean {
  if (!candidate) return false;
  const trimmed = candidate.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      parsed.hostname.length > 0
    );
  } catch {
    return false;
  }
}
