import type { ReactElement, ReactNode } from 'react';
import type { TeamsModule } from '../teams-module';
import { TeamsModuleContext } from './teams-module-context';

export interface TeamsModuleProviderProps {
  readonly module: TeamsModule;
  readonly children: ReactNode;
}

export const TeamsModuleProvider = ({
  module,
  children,
}: TeamsModuleProviderProps): ReactElement => (
  <TeamsModuleContext.Provider value={module}>{children}</TeamsModuleContext.Provider>
);
