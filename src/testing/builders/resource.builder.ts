import { Resource, type ResourceProps } from '@features/resources/domain';

export type ResourceOverrides = Partial<ResourceProps>;

/** Construct a valid {@link Resource} for tests, overriding only what matters per case. */
export const buildResource = (overrides: ResourceOverrides = {}): Resource =>
  new Resource({
    id: overrides.id ?? 'resource-1',
    title: overrides.title ?? 'Overview of Application Process',
    type: overrides.type ?? 'Guide',
    category: overrides.category ?? 'Getting Started',
    views: overrides.views ?? 2341,
    helpful: overrides.helpful ?? 95,
    updated: overrides.updated ?? new Date('2024-01-15T00:00:00.000Z'),
  });
