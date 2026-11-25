import { createContext } from 'react';
import type { SearchModule } from '../search-module';

/** Holds the DI-built search module. Populated by `SearchModuleProvider` at the composition root. */
export const SearchModuleContext = createContext<SearchModule | null>(null);
