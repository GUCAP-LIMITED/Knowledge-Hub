import { createContext } from 'react';
import type { ContentModule } from '../content-module';

/** Holds the DI-built content module. Populated by `ContentModuleProvider` at the composition root. */
export const ContentModuleContext = createContext<ContentModule | null>(null);
