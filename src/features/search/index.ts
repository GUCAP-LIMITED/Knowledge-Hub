export type {
  SearchContentTab,
  GlobalSearchItem,
  GlobalSearchResult,
  GlobalSearchParams,
} from './domain/types';
export type { SearchGateway } from './domain/ports/search-gateway';
export {
  createSearchModule,
  type SearchModule,
  type SearchModuleDeps,
} from './search-module';
export { SearchModuleContext } from './presentation/search-module-context';
export {
  SearchModuleProvider,
  type SearchModuleProviderProps,
} from './presentation/SearchModuleProvider';
export { useSearchModule } from './presentation/use-search-module';
export { useGlobalSearch } from './presentation/use-global-search';
