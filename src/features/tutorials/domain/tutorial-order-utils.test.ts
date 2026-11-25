import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  getSavedPlaylistOrder,
  savePlaylistOrder,
  sortMediaBySavedOrder,
} from './tutorial-order-utils';

describe('tutorial-order-utils', () => {
  const contentId = 'test-tutorial-123';

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('getSavedPlaylistOrder and savePlaylistOrder', () => {
    it('returns empty array when contentId is nullish or empty', () => {
      expect(getSavedPlaylistOrder('')).toEqual([]);
      expect(getSavedPlaylistOrder(null)).toEqual([]);
      expect(getSavedPlaylistOrder(undefined)).toEqual([]);
    });

    it('returns empty array when no order has been saved', () => {
      expect(getSavedPlaylistOrder(contentId)).toEqual([]);
    });

    it('persists and retrieves ordered video IDs', () => {
      const ids = ['video-b', 'video-a', 'video-c'];
      savePlaylistOrder(contentId, ids);
      expect(getSavedPlaylistOrder(contentId)).toEqual(ids);
    });

    it('handles corrupted localStorage JSON gracefully', () => {
      localStorage.setItem(`tutorial_playlist_order_${contentId}`, 'invalid-json{{[');
      expect(getSavedPlaylistOrder(contentId)).toEqual([]);
    });

    it('handles non-array localStorage value gracefully', () => {
      localStorage.setItem(
        `tutorial_playlist_order_${contentId}`,
        JSON.stringify({ not: 'an-array' }),
      );
      expect(getSavedPlaylistOrder(contentId)).toEqual([]);
    });
  });

  describe('sortMediaBySavedOrder', () => {
    it('falls back to displayOrder when no saved order is in localStorage', () => {
      const items = [
        { id: 'v2', displayOrder: 2 },
        { id: 'v0', displayOrder: 0 },
        { id: 'v1', displayOrder: 1 },
      ];

      const sorted = sortMediaBySavedOrder(items, contentId);
      expect(sorted.map((item) => item.id)).toEqual(['v0', 'v1', 'v2']);
    });

    it('sorts items according to the saved ID sequence', () => {
      savePlaylistOrder(contentId, ['v2', 'v0', 'v1']);

      const items = [
        { id: 'v0', displayOrder: 0 },
        { id: 'v1', displayOrder: 1 },
        { id: 'v2', displayOrder: 2 },
      ];

      const sorted = sortMediaBySavedOrder(items, contentId);
      expect(sorted.map((item) => item.id)).toEqual(['v2', 'v0', 'v1']);
    });

    it('places items not in the saved list after saved items', () => {
      savePlaylistOrder(contentId, ['v2']);

      const items = [
        { id: 'v0', displayOrder: 0 },
        { id: 'v1', displayOrder: 1 },
        { id: 'v2', displayOrder: 2 },
      ];

      const sorted = sortMediaBySavedOrder(items, contentId);
      expect(sorted[0]?.id).toBe('v2');
      expect(sorted.slice(1).map((item) => item.id)).toEqual(['v0', 'v1']);
    });
  });
});
