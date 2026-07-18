import { createContext } from 'react';
import type { TeamsModule } from '../teams-module';

export const TeamsModuleContext = createContext<TeamsModule | null>(null);
