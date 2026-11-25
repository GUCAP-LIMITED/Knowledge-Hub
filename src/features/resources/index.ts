/**
 * Public API of the `resources` feature. The app shell and other features import ONLY from here.
 * Backed by an in-memory gateway seeded from the prototype knowledge base (swap for HTTP to go live).
 */
export {
  createResourcesModule,
  type ResourcesModule,
  type ResourcesModuleDeps,
} from './resources-module';
export {
  ResourcesModuleProvider,
  useResources,
  useInfiniteResources,
  useResource,
  useUpdateResource,
  useMarkResourceHelpful,
  useMarkResourceComplete,
  resourcesQueryKey,
  resourceQueryKey,
  ResourceEditModal,
} from './presentation';
export {
  Resource,
  type ResourceProps,
  type ResourceAttachment,
  type ResourceCatalogParams,
  type PagedResult,
} from './domain';
