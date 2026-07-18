import { useContext } from 'react';
import type { TeamsModule } from '../teams-module';
import { TeamsModuleContext } from './teams-module-context';

export const useTeamsModule = (): TeamsModule => {
  const module = useContext(TeamsModuleContext);
  if (module === null) {
    throw new Error('useTeamsModule must be used within a TeamsModuleProvider');
  }
  return module;
};
