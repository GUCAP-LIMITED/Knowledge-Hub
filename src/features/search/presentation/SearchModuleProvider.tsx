import type { ReactElement, ReactNode } from 'react';
import type { SearchModule } from '../search-module';
import { SearchModuleContext } from './search-module-context';

export interface SearchModuleProviderProps {
  readonly module: SearchModule;
  readonly children: ReactNode;
}

export const SearchModuleProvider = ({
  module,
  children,
}: SearchModuleProviderProps): ReactElement => (
  <SearchModuleContext.Provider value={module}>{children}</SearchModuleContext.Provider>
);
