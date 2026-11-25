/**
 * Generates an RFC 4122 v4 compliant GUID/UUID string.
 * Uses the Web Cryptography API when available, with a random fallback.
 */
export const generateGuid = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const GUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Checks whether a given string is a valid GUID/UUID.
 */
export const isValidGuid = (id: string | null | undefined): boolean => {
  if (!id) return false;
  return GUID_REGEX.test(id);
};
