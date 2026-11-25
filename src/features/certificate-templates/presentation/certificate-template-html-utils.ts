/** Escape text destined for raw HTML — admin-typed copy is untrusted input at this boundary. */
export const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

/** Attribute on the canvas that marks an admin-uploaded background. Without it, a saved
 * template's background is an older one and is ignored in favour of the shipped artwork. */
export const CUSTOM_BACKGROUND_ATTR_NAME = 'data-background';
export const CUSTOM_BACKGROUND_ATTR_VALUE = 'custom';
