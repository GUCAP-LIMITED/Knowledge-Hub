import { createContext } from 'react';
import type { ContentModule } from '../content-module';

export const ContentModuleContext = createContext<ContentModule | null>(null);
