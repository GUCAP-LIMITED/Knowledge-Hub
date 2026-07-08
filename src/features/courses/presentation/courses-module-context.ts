import { createContext } from 'react';
import type { CoursesModule } from '../courses-module';

/** Holds the DI-built courses module. Populated by `CoursesModuleProvider` at the composition root. */
export const CoursesModuleContext = createContext<CoursesModule | null>(null);
