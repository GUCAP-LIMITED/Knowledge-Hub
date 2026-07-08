import { createContext } from 'react';
import type { TutorialsModule } from '../tutorials-module';

/** Holds the DI-built tutorials module. Populated by `TutorialsModuleProvider` at the composition root. */
export const TutorialsModuleContext = createContext<TutorialsModule | null>(null);
