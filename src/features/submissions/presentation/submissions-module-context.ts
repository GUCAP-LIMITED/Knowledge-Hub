import { createContext } from 'react';
import type { SubmissionsModule } from '../submissions-module';

/** Holds the DI-built submissions module. Populated by `SubmissionsModuleProvider`. */
export const SubmissionsModuleContext = createContext<SubmissionsModule | null>(null);
