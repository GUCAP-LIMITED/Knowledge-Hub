/**
 * Public API of the `content` feature — the content-management workspace (author, publish, delete).
 * Backed by an in-memory gateway seeded from the prototype library (swap for HTTP to go live).
 */
export {
  createContentModule,
  type ContentModule,
  type ContentModuleDeps,
} from './content-module';
export {
  ContentModuleProvider,
  useContent,
  useCreateContent,
  usePublishContent,
  useDeleteContent,
  contentQueryKey,
} from './presentation';
export {
  ContentItem,
  type ContentItemProps,
  type ContentType,
  type ContentStatus,
} from './domain';
