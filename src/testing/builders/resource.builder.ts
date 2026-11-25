import { Resource, type ResourceProps } from '@features/resources/domain';

export type ResourceOverrides = Partial<ResourceProps>;

/** Construct a valid {@link Resource} for tests, overriding only what matters per case. */
export const buildResource = (overrides: ResourceOverrides = {}): Resource =>
  new Resource({
    id: 'resource-1',
    title: 'Overview of Application Process',
    subtitle: null,
    type: 'Guide',
    category: 'Getting Started',
    categoryId: 'cat-1',
    views: 2341,
    helpful: 95,
    isHelpful: false,
    updated: new Date('2024-01-15T00:00:00.000Z'),
    rating: 0,
    totalReviews: 0,
    isCompleted: false,
    canModify: false,
    ...overrides,
  });
