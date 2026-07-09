import { useContext } from 'react';
import type { TeamModule } from '../team-module';
import { TeamModuleContext } from './team-module-context';

/** Resolve the injected team use cases. Throws if used outside the provider. */
export const useTeamModule = (): TeamModule => {
  const module = useContext(TeamModuleContext);
  if (module === null) {
    throw new Error('Team hooks must be used within <TeamModuleProvider>.');
  }
  return module;
};
