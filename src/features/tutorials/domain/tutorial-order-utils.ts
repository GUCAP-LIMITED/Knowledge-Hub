/**
 * Utilities for persisting and resolving playlist display order for multi-video tutorials.
 * Serves as an immediate resilience bridge across draft revisions and published refreshes.
 */

const STORAGE_PREFIX = 'tutorial_playlist_order_';

/**
 * Retrieves the saved video ID sequence from localStorage for a given tutorial/content ID.
 */
export const getSavedPlaylistOrder = (contentId?: string | null): readonly string[] => {
  if (!contentId) return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${contentId}`);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((id): id is string => typeof id === 'string' && id.length > 0);
    }
  } catch {
    // Graceful fallback on localStorage parsing error
  }
  return [];
};

/**
 * Persists an ordered array of video IDs to localStorage for a given tutorial/content ID.
 */
export const savePlaylistOrder = (
  contentId: string | undefined | null,
  orderedIds: readonly string[],
): void => {
  if (!contentId || orderedIds.length === 0) return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${contentId}`, JSON.stringify(orderedIds));
  } catch {
    // Graceful fallback on localStorage write error
  }
};

/**
 * Sorts an array of media items according to the saved playlist sequence in localStorage.
 * Falls back to displayOrder if no saved sequence exists.
 */
export const sortMediaBySavedOrder = <
  T extends {
    readonly id?: string | null | undefined;
    readonly displayOrder?: number | null | undefined;
  },
>(
  items: readonly T[],
  contentId?: string | null,
): readonly T[] => {
  const savedOrder = getSavedPlaylistOrder(contentId);
  if (savedOrder.length === 0) {
    return [...items].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  const orderMap = new Map<string, number>();
  savedOrder.forEach((id, idx) => {
    orderMap.set(id, idx);
  });

  return [...items].sort((a, b) => {
    const orderA = a.id ? orderMap.get(a.id) : undefined;
    const orderB = b.id ? orderMap.get(b.id) : undefined;

    if (orderA !== undefined && orderB !== undefined) {
      return orderA - orderB;
    }
    if (orderA !== undefined) return -1;
    if (orderB !== undefined) return 1;

    return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
  });
};
