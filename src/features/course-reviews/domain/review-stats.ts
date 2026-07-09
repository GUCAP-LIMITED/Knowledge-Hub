import type { Review } from './entities/review';

/**
 * Average star rating for a set of reviews, rounded to one decimal. A pure domain function so the
 * "course rating = mean of its reviews" rule lives in the domain, not in a component.
 */
export const averageRating = (reviews: readonly Review[]): number => {
  if (reviews.length === 0) {
    return 0;
  }
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
};
