import { describe, expect, it } from 'vitest';
import { buildReview } from '@testing';
import { averageRating } from './review-stats';

describe('averageRating', () => {
  it('is 0 when there are no reviews', () => {
    expect(averageRating([])).toBe(0);
  });

  it('averages the ratings, rounded to one decimal', () => {
    const reviews = [
      buildReview({ id: 'a', rating: 5 }),
      buildReview({ id: 'b', rating: 4 }),
      buildReview({ id: 'c', rating: 4 }),
    ];
    expect(averageRating(reviews)).toBe(4.3);
  });
});
