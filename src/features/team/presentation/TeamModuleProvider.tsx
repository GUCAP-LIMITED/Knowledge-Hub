import type { ReactElement, ReactNode } from 'react';
import type { TeamModule } from '../team-module';
import { TeamModuleContext } from './team-module-context';

export interface TeamModuleProviderProps {
  readonly module: TeamModule;
  readonly children: ReactNode;
}

/** Provides the injected team use cases to the React tree. Wiring lives in the composition root. */
export const TeamModuleProvider = ({
  module,
  children,
}: TeamModuleProviderProps): ReactElement => (
  <TeamModuleContext.Provider value={module}>{children}</TeamModuleContext.Provider>
);
