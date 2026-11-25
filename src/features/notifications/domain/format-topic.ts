/**
 * Formats a notification topic identifier (e.g. "ContentSubmission")
 * into a human-readable, well-formatted label (e.g. "Content Submission").
 */
export function formatNotificationTopic(topic?: string | null): string {
  if (!topic) return '';
  const spaced = topic
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([a-zA-Z])(\d+)/g, '$1 $2')
    .replace(/(\d+)([a-zA-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  return spaced.replace(/\b\w/g, (char) => char.toUpperCase());
}
