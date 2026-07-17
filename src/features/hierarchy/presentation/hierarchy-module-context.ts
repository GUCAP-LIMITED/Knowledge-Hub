import { createContext } from 'react';
import type { HierarchyModule } from '../hierarchy-module';

/** Holds the DI-built hierarchy module. Populated by HierarchyModuleProvider at the composition root. */
export const HierarchyModuleContext = createContext<HierarchyModule | null>(null);
