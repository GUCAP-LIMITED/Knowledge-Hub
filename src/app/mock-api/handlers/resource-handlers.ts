import { categoryName, certificateIdFor, ratingOf } from '../content-index';
import {
  can,
  normalizeQuery,
  notFound,
  paginate,
  requireUser,
  sortBy,
} from '../mock-context';
import type { MockState } from '../mock-state';
import type { MockRequest, MockRoute } from '../mock-types';
import { categoryId } from '../seed/categories';
import { findMediaAsset } from '../seed/media-assets';
import type { MockUser } from '../seed/mock-users';
import type { ResourceSeed } from '../seed/resource-seed';
import { svgThumb } from '../seed/svg-thumb';

const BASE = '/api/app/resource';

const findResource = (state: MockState, idOrSlug: string): ResourceSeed => {
  const resource = state.resources.find((r) => r.id === idOrSlug || r.slug === idOrSlug);
  if (resource === undefined) {
    throw notFound('Resource');
  }
  return resource;
};

const fileDto = (assetId: string): Record<string, unknown> => {
  const asset = findMediaAsset(assetId);
  return {
    id: assetId,
    originalFileName: asset?.fileName ?? 'document.pdf',
    url: asset?.url ?? null,
    sizeBytes: asset?.sizeBytes ?? 0,
  };
};

const toRow = (
  state: MockState,
  r: ResourceSeed,
  user: MockUser,
): Record<string, unknown> => {
  const key = `${user.id}:${r.id}`;
  const done = state.completions.get(key);
  const helpful = state.helpfulVotes.has(key);
  const primary = fileDto(r.primaryAssetId);
  const rating = ratingOf(state, r.id);
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    subtitle: r.subtitle,
    description: r.description,
    type: r.type,
    visibility: r.visibility,
    categoryId: categoryId(10, r.category),
    categoryName: categoryName(state, categoryId(10, r.category)) ?? r.category,
    thumbnailUrl: svgThumb(r.title, r.hue),
    primaryMedia: primary,
    attachments: r.attachmentAssetIds.map(fileDto),
    media: [],
    helpfulCount: r.helpfulCount + (helpful ? 1 : 0),
    isHelpful: helpful,
    isCompleted: done !== undefined,
    completedAt: done?.at ?? null,
    certificateId: done === undefined ? null : certificateIdFor(user.id, r.id),
    certificateUrl: null,
    averageRating: rating.average,
    rating: rating.average,
    totalReviews: rating.total,
    canModify: can(state, user, 'Resources.Edit'),
  };
};

const sorters = (
  state: MockState,
): Record<string, (item: ResourceSeed) => string | number> => ({
  title: (r: ResourceSeed): string => r.title,
  creationtime: (r: ResourceSeed): number => Date.parse(r.createdAt),
  rating: (r: ResourceSeed): number => ratingOf(state, r.id).average,
});

const catalog = (state: MockState, request: MockRequest): unknown => {
  const user = requireUser(request);
  const query = normalizeQuery(request.query);
  const needle = (query.filter ?? '').toLowerCase();
  const matches = state.resources.filter(
    (r) =>
      (needle === '' ||
        `${r.title} ${r.subtitle} ${r.category}`.toLowerCase().includes(needle)) &&
      (query.categoryid === undefined ||
        categoryId(10, r.category) === query.categoryid) &&
      (query.category === undefined || r.category === query.category),
  );
  const page = paginate(sortBy(matches, query.sorting, sorters(state)), query);
  return {
    items: page.items.map((r) => toRow(state, r, user)),
    totalCount: page.totalCount,
  };
};

const stats = (state: MockState): unknown => ({
  totalCount: state.resources.length,
  categories: state.categories
    .filter((c) => c.type === 10)
    .map((c) => ({
      categoryId: c.id,
      name: c.name,
      slug: c.slug,
      count: state.resources.filter((r) => categoryId(10, r.category) === c.id).length,
    })),
});

export const resourceHandlers = (state: MockState): readonly MockRoute[] => [
  { method: 'GET', pattern: `${BASE}/catalog`, handler: (r) => catalog(state, r) },
  { method: 'GET', pattern: `${BASE}/stats`, handler: () => stats(state) },
  {
    method: 'GET',
    pattern: `${BASE}/:id/catalog-item`,
    handler: (r) => toRow(state, findResource(state, r.params.id ?? ''), requireUser(r)),
  },
  {
    method: 'POST',
    pattern: `${BASE}/:id/mark-complete`,
    handler: (r) => {
      const user = requireUser(r);
      const resource = findResource(state, r.params.id ?? '');
      state.completions.set(`${user.id}:${resource.id}`, {
        at: state.now.toISOString(),
        videos: new Set(),
      });
      return toRow(state, resource, user);
    },
  },
  {
    method: 'POST',
    pattern: `${BASE}/:id/mark-helpful`,
    handler: (r) => {
      const key = `${requireUser(r).id}:${findResource(state, r.params.id ?? '').id}`;
      if (!state.helpfulVotes.delete(key)) {
        state.helpfulVotes.add(key);
      }
      return null;
    },
  },
];
