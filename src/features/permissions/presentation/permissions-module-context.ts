import { createContext } from 'react';
import type { PermissionsModule } from '../permissions-module';

/** Holds the DI-built permissions module. Populated by PermissionsModuleProvider at the composition root. */
export const PermissionsModuleContext = createContext<PermissionsModule | null>(null);
