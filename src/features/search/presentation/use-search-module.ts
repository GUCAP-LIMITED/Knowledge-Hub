import { useContext } from 'react';
import type { SearchModule } from '../search-module';
import { SearchModuleContext } from './search-module-context';

export const useSearchModule = (): SearchModule => {
  const module = useContext(SearchModuleContext);
  if (module === null) {
    throw new Error('useSearchModule must be used within <SearchModuleProvider>.');
  }
  return module;
};
