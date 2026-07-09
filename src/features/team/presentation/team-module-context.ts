import { createContext } from 'react';
import type { TeamModule } from '../team-module';

/** Holds the DI-built team module. Populated by `TeamModuleProvider` at the composition root. */
export const TeamModuleContext = createContext<TeamModule | null>(null);
