import { createContext } from 'react';
import type { AssignmentsModule } from '../assignments-module';

/** Holds the DI-built assignments module. Populated by `AssignmentsModuleProvider`. */
export const AssignmentsModuleContext = createContext<AssignmentsModule | null>(null);
