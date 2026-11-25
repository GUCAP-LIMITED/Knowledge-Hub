import { describe, expect, it } from 'vitest';
import { RecentReview, Review } from '../domain';
import {
  extractReviewsFromCache,
  resolveReviewInput,
  syncReviewInCache,
  updateReviewList,
} from './reviews-cache-utils';

const createReview = (id: string, helpful = 0, isHelpful = false): Review =>
  new Review({
    id,
    contentId: 'course-1',
    contentName: 'Clean Architecture',
    userId: 'user-1',
    userName: 'John Doe',
    userRole: 'Learner',
    rating: 5,
    feedback: 'Great course!',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    helpful,
    isHelpful,
  });

const createRecentReview = (
  id: string,
  helpfulCount = 0,
  isHelpful = false,
): RecentReview =>
  new RecentReview({
    id,
    contentItemId: 'course-1',
    courseTitle: 'Clean Architecture',
    courseSlug: 'clean-architecture',
    courseThumbnailUrl: null,
    userId: 'user-1',
    reviewerName: 'John Doe',
    reviewerEmail: null,
    rating: 5,
    feedback: 'Great course!',
    helpfulCount,
    isHelpful,
    creationTime: new Date('2026-01-01T00:00:00Z'),
  });

describe('reviews-cache-utils', () => {
  describe('resolveReviewInput', () => {
    it('handles string id', () => {
      expect(resolveReviewInput('rev-1')).toEqual({ id: 'rev-1' });
    });

    it('handles object with id and isHelpful', () => {
      expect(resolveReviewInput({ id: 'rev-2', isHelpful: true })).toEqual({
        id: 'rev-2',
        isHelpful: true,
      });
    });

    it('handles Review instance', () => {
      const review = createReview('rev-3', 2, false);
      expect(resolveReviewInput(review)).toEqual({ id: 'rev-3', isHelpful: false });
    });
  });

  describe('updateReviewList', () => {
    it('optimistically marks a review as helpful in an array', () => {
      const initial = [createReview('rev-1', 2, false), createReview('rev-2', 0, false)];
      const updated = updateReviewList(initial, 'rev-1', true) as Review[];

      expect(updated[0]!.helpful).toBe(3);
      expect(updated[0]!.isHelpful).toBe(true);
      expect(updated[1]!.helpful).toBe(0);
      expect(updated[1]!.isHelpful).toBe(false);
    });

    it('optimistically unmarks a review as helpful in an array without going below 0', () => {
      const initial = [createReview('rev-1', 1, true)];
      const updated = updateReviewList(initial, 'rev-1', false) as Review[];

      expect(updated[0]!.helpful).toBe(0);
      expect(updated[0]!.isHelpful).toBe(false);
    });

    it('updates items inside a paged result for both Review and RecentReview', () => {
      const paged = {
        totalCount: 2,
        items: [
          createReview('rev-1', 1, false),
          createRecentReview('recent-1', 4, false),
        ],
      };

      const updated = updateReviewList(paged, 'recent-1', true) as {
        totalCount: number;
        items: (Review | RecentReview)[];
      };

      const recentItem = updated.items[1] as RecentReview;
      expect(recentItem.helpfulCount).toBe(5);
      expect(recentItem.isHelpful).toBe(true);
    });
  });

  describe('syncReviewInCache', () => {
    it('replaces the review entity in array cache with server authoritative review', () => {
      const initial = [createReview('rev-1', 2, false)];
      const serverReview = createReview('rev-1', 3, true);

      const updated = syncReviewInCache(initial, serverReview) as Review[];
      expect(updated[0]).toBe(serverReview);
    });

    it('updates RecentReview inside paged cache when matched by id', () => {
      const paged = {
        totalCount: 1,
        items: [createRecentReview('rev-1', 1, false)],
      };
      const serverReview = createReview('rev-1', 2, true);

      const updated = syncReviewInCache(paged, serverReview) as {
        totalCount: number;
        items: RecentReview[];
      };
      expect(updated.items[0]!.helpfulCount).toBe(2);
      expect(updated.items[0]!.isHelpful).toBe(true);
    });
  });

  describe('extractReviewsFromCache', () => {
    it('returns empty array for non-array and non-paged data', () => {
      expect(extractReviewsFromCache(null)).toEqual([]);
      expect(extractReviewsFromCache(undefined)).toEqual([]);
      expect(extractReviewsFromCache({})).toEqual([]);
    });

    it('extracts Review entities from an array', () => {
      const r1 = createReview('rev-1');
      expect(extractReviewsFromCache([r1, 'non-review'])).toEqual([r1]);
    });

    it('extracts Review entities from a paged result', () => {
      const r1 = createReview('rev-1');
      expect(extractReviewsFromCache({ items: [r1] })).toEqual([r1]);
    });
  });
});
