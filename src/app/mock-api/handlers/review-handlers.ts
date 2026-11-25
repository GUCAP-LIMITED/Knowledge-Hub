import { catalogRefs, findRef, ratingOf, type CatalogRef } from '../content-index';
import { normalizeQuery, notFound, paginate, requireUser, sortBy } from '../mock-context';
import { nextId, type MockState } from '../mock-state';
import type { MockRequest, MockRoute } from '../mock-types';
import type { MockReview } from '../seed/review-seed';

const BASE = '/api/app/review';

const reviewerName = (state: MockState, userId: string): string =>
  state.directory.find((u) => u.id === userId)?.name ?? 'Anonymous';

const toDto = (
  state: MockState,
  review: MockReview,
  viewerId: string,
): Record<string, unknown> => {
  const ref = findRef(state, review.contentId);
  return {
    id: review.id,
    contentItemId: review.contentId,
    contentTitle: ref?.title ?? null,
    contentType: ref?.type ?? null,
    contentTypeName: ref?.typeName ?? null,
    type: ref?.type ?? null,
    userId: review.userId,
    userName: reviewerName(state, review.userId),
    rating: review.rating,
    feedback: review.feedback,
    helpfulCount: review.helpfulBy.size,
    isHelpful: review.helpfulBy.has(viewerId),
    creationTime: review.creationTime,
  };
};

const toRecent = (
  state: MockState,
  review: MockReview,
  viewerId: string,
): Record<string, unknown> => {
  const ref = findRef(state, review.contentId);
  const user = state.directory.find((u) => u.id === review.userId);
  return {
    id: review.id,
    contentItemId: review.contentId,
    courseTitle: ref?.title ?? 'Unknown',
    courseSlug: ref?.slug ?? review.contentId,
    courseThumbnailUrl: ref?.thumbnailUrl ?? null,
    userId: review.userId,
    reviewerName: reviewerName(state, review.userId),
    reviewerEmail: user?.email ?? null,
    rating: review.rating,
    feedback: review.feedback,
    helpfulCount: review.helpfulBy.size,
    isHelpful: review.helpfulBy.has(viewerId),
    creationTime: review.creationTime,
  };
};

const filtered = (
  state: MockState,
  query: Readonly<Record<string, string>>,
): MockReview[] =>
  state.reviews.filter((r) => {
    const ref = findRef(state, r.contentId);
    return (
      (query.contentitemid === undefined || r.contentId === query.contentitemid) &&
      (query.contenttype === undefined || ref?.type === Number(query.contenttype)) &&
      (query.stars === undefined || r.rating === Number(query.stars))
    );
  });

const SORTERS = {
  creationtime: (r: MockReview): number => Date.parse(r.creationTime),
  rating: (r: MockReview): number => r.rating,
  helpfulcount: (r: MockReview): number => r.helpfulBy.size,
} as const;

const find = (state: MockState, id: string): MockReview => {
  const review = state.reviews.find((r) => r.id === id);
  if (review === undefined) {
    throw notFound('Review');
  }
  return review;
};

const statistics = (state: MockState, request: MockRequest): unknown => {
  const top = Number(normalizeQuery(request.query).topcount ?? 5);
  const reviews = state.reviews;
  const count = (stars: number): number =>
    reviews.filter((r) => r.rating === stars).length;
  const rated = catalogRefs(state).filter((ref) => ratingOf(state, ref.id).total > 0);
  const topRated = (ref: CatalogRef): Record<string, unknown> => {
    const rating = ratingOf(state, ref.id);
    return {
      courseId: ref.id,
      title: ref.title,
      slug: ref.slug,
      averageRating: rating.average,
      totalReviews: rating.total,
      totalHelpfulVotes: state.reviews
        .filter((r) => r.contentId === ref.id)
        .reduce((sum, r) => sum + r.helpfulBy.size, 0),
      thumbnailUrl: ref.thumbnailUrl,
    };
  };
  return {
    totalReviews: reviews.length,
    averageRating:
      reviews.length === 0
        ? 0
        : Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) /
          10,
    totalRatedCourses: rated.length,
    totalHelpfulVotes: reviews.reduce((s, r) => s + r.helpfulBy.size, 0),
    ratingBreakdown: {
      fiveStars: count(5),
      fourStars: count(4),
      threeStars: count(3),
      twoStars: count(2),
      oneStar: count(1),
    },
    topRatedCourses: rated
      .map(topRated)
      .sort((a, b) => Number(b.averageRating) - Number(a.averageRating))
      .slice(0, top),
  };
};

const toggleHelpful = (state: MockState, request: MockRequest, on: boolean): unknown => {
  const user = requireUser(request);
  const review = find(state, request.params.id ?? '');
  if (on) {
    review.helpfulBy.add(user.id);
  } else {
    review.helpfulBy.delete(user.id);
  }
  return toDto(state, review, user.id);
};

const submit = (state: MockState, request: MockRequest): unknown => {
  const user = requireUser(request);
  const contentId = findRef(state, request.params.contentId ?? '')?.id ?? '';
  const body = request.body as { rating: number; feedback?: string };
  const existing = state.reviews.findIndex(
    (r) => r.contentId === contentId && r.userId === user.id,
  );
  const review: MockReview = {
    id:
      existing >= 0
        ? (state.reviews[existing]?.id ?? nextId(state, 'rev'))
        : nextId(state, 'rev'),
    contentId,
    userId: user.id,
    rating: body.rating,
    feedback: body.feedback ?? '',
    creationTime: state.now.toISOString(),
    helpfulBy: new Set<string>(),
  };
  if (existing >= 0) {
    state.reviews.splice(existing, 1, review);
  } else {
    state.reviews.unshift(review);
  }
  return toDto(state, review, user.id);
};

const listRoutes = (state: MockState): readonly MockRoute[] => [
  {
    method: 'GET',
    pattern: BASE,
    handler: (request) => {
      const viewer = requireUser(request);
      const query = normalizeQuery(request.query);
      const page = paginate(
        sortBy(filtered(state, query), query.sorting ?? 'creationTime desc', SORTERS),
        query,
      );
      return {
        totalCount: page.totalCount,
        items: page.items.map((r) => toDto(state, r, viewer.id)),
      };
    },
  },
  {
    method: 'GET',
    pattern: `${BASE}/for-content/:contentId`,
    handler: (request) => {
      const viewer = requireUser(request);
      const id = findRef(state, request.params.contentId ?? '')?.id ?? '';
      const list = state.reviews.filter((r) => r.contentId === id);
      return {
        totalCount: list.length,
        items: list.map((r) => toDto(state, r, viewer.id)),
      };
    },
  },
  {
    method: 'GET',
    pattern: `${BASE}/recent`,
    handler: (request) => {
      const viewer = requireUser(request);
      const query = normalizeQuery(request.query);
      const page = paginate(
        sortBy(filtered(state, query), 'creationTime desc', SORTERS),
        query,
      );
      return {
        totalCount: page.totalCount,
        items: page.items.map((r) => toRecent(state, r, viewer.id)),
      };
    },
  },
  {
    method: 'GET',
    pattern: `${BASE}/course-statistics`,
    handler: (r) => statistics(state, r),
  },
];

const writeRoutes = (state: MockState): readonly MockRoute[] => [
  {
    method: 'GET',
    pattern: `${BASE}/selectable-content-items`,
    handler: (request) => {
      const query = normalizeQuery(request.query);
      const needle = (query.filter ?? '').toLowerCase();
      const matches = catalogRefs(state).filter(
        (ref) =>
          (query.type === undefined || ref.type === Number(query.type)) &&
          ref.title.toLowerCase().includes(needle),
      );
      const page = paginate(matches, query);
      return {
        totalCount: page.totalCount,
        items: page.items.map((ref) => ({
          id: ref.id,
          title: ref.title,
          slug: ref.slug,
          type: ref.type,
          typeName: ref.typeName,
        })),
      };
    },
  },
  {
    method: 'POST',
    pattern: `${BASE}/submit/:contentId`,
    handler: (r) => submit(state, r),
  },
  {
    method: 'POST',
    pattern: `${BASE}/:id/mark-helpful`,
    handler: (r) => toggleHelpful(state, r, true),
  },
  {
    method: 'POST',
    pattern: `${BASE}/:id/unmark-helpful`,
    handler: (r) => toggleHelpful(state, r, false),
  },
  {
    method: 'DELETE',
    pattern: `${BASE}/:id`,
    handler: (request) => {
      const index = state.reviews.findIndex((r) => r.id === request.params.id);
      if (index < 0) {
        throw notFound('Review');
      }
      state.reviews.splice(index, 1);
      return null;
    },
  },
];

export const reviewHandlers = (state: MockState): readonly MockRoute[] => [
  ...listRoutes(state),
  ...writeRoutes(state),
];
