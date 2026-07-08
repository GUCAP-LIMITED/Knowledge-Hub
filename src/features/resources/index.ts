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
  useMarkResourceHelpful,
  resourcesQueryKey,
} from './presentation';
export { Resource, type ResourceProps } from './domain';
