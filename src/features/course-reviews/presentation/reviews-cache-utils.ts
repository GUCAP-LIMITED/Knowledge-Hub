import { RecentReview, Review } from '../domain';

export type ToggleReviewHelpfulInput =
  | Review
  | { readonly id: string; readonly isHelpful?: boolean | undefined }
  | string;

export const resolveReviewInput = (
  input: ToggleReviewHelpfulInput,
): { readonly id: string; readonly isHelpful?: boolean | undefined } => {
  if (typeof input === 'string') {
    return { id: input };
  }
  return { id: input.id, isHelpful: input.isHelpful };
};

/** Tracks the target toggle direction per review ID across optimistic updates and mutation execution. */
export const pendingToggleDirections = new Map<string, boolean>();

/** Cached review lists keyed under the reviews prefix, captured for optimistic rollback. */
export type ReviewSnapshots = [readonly unknown[], unknown][];

const toggleReviewHelpful = (
  review: Review,
  id: string,
  targetIsHelpful: boolean,
): Review => {
  if (review.id !== id) {
    return review;
  }
  const nextHelpful = targetIsHelpful
    ? review.helpful + (review.isHelpful ? 0 : 1)
    : Math.max(0, review.helpful - (review.isHelpful ? 1 : 0));
  return review.withHelpful(nextHelpful, targetIsHelpful);
};

export const updateReviewList = (
  data: unknown,
  id: string,
  targetIsHelpful: boolean,
): unknown => {
  if (!data) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item: unknown) => {
      if (item instanceof Review) {
        return toggleReviewHelpful(item, id, targetIsHelpful);
      }
      return item;
    });
  }
  if (typeof data === 'object' && 'items' in (data as Record<string, unknown>)) {
    const paged = data as { items: readonly unknown[]; totalCount: number };
    return {
      ...paged,
      items: paged.items.map((item: unknown) => {
        if (item instanceof Review) {
          return toggleReviewHelpful(item, id, targetIsHelpful);
        }
        if (item instanceof RecentReview && item.id === id) {
          const nextCount = targetIsHelpful
            ? item.helpfulCount + (item.isHelpful ? 0 : 1)
            : Math.max(0, item.helpfulCount - (item.isHelpful ? 1 : 0));
          return item.withHelpful(nextCount, targetIsHelpful);
        }
        return item;
      }),
    };
  }
  return data;
};

export const syncReviewInCache = (data: unknown, updatedReview: Review): unknown => {
  if (!data) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item: unknown) => {
      if (item instanceof Review && item.id === updatedReview.id) {
        return updatedReview;
      }
      return item;
    });
  }
  if (typeof data === 'object' && 'items' in (data as Record<string, unknown>)) {
    const paged = data as { items: readonly unknown[]; totalCount: number };
    return {
      ...paged,
      items: paged.items.map((item: unknown) => {
        if (item instanceof Review && item.id === updatedReview.id) {
          return updatedReview;
        }
        if (item instanceof RecentReview && item.id === updatedReview.id) {
          return item.withHelpful(updatedReview.helpful, updatedReview.isHelpful);
        }
        return item;
      }),
    };
  }
  return data;
};

export const extractReviewsFromCache = (data: unknown): readonly Review[] => {
  if (!data) {
    return [];
  }
  if (Array.isArray(data)) {
    return data.filter((item: unknown): item is Review => item instanceof Review);
  }
  if (typeof data === 'object' && 'items' in (data as Record<string, unknown>)) {
    const paged = data as { items: readonly unknown[] };
    return paged.items.filter((item: unknown): item is Review => item instanceof Review);
  }
  return [];
};
