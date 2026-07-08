import { createContext } from 'react';
import type { ResourcesModule } from '../resources-module';

/** Holds the DI-built resources module. Populated by `ResourcesModuleProvider` at the composition root. */
export const ResourcesModuleContext = createContext<ResourcesModule | null>(null);
