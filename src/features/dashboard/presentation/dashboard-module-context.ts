import { createContext } from 'react';
import type { DashboardModule } from '../dashboard-module';

/** Holds the DI-built dashboard module. Populated by DashboardModuleProvider at the composition root. */
export const DashboardModuleContext = createContext<DashboardModule | null>(null);
