/** Public API of the content feature. */
export {
  createContentModule,
  type ContentModule,
  type ContentModuleDeps,
} from './content-module';
export {
  ContentModuleProvider,
  useUploadContent,
  useContentCategories,
  useMyBranches,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useContentList,
  contentKeys,
  type CategoryKind,
  type UploadWizardInput,
} from './presentation';
export { CONTENT_TYPE } from './domain';
export type {
  ContentDetail,
  ContentSummary,
  ContentCategory,
  CategoryInput,
  BranchOption,
  MediaAsset,
} from './domain';
