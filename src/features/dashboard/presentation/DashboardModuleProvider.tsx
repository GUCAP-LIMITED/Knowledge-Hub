import type { ReactElement, ReactNode } from 'react';
import type { DashboardModule } from '../dashboard-module';
import { DashboardModuleContext } from './dashboard-module-context';

export interface DashboardModuleProviderProps {
  readonly module: DashboardModule;
  readonly children: ReactNode;
}

/**
 * Provides the injected dashboard use cases to the React tree. The module is built by the
 * composition root, so this component stays free of wiring.
 */
export const DashboardModuleProvider = ({
  module,
  children,
}: DashboardModuleProviderProps): ReactElement => (
  <DashboardModuleContext.Provider value={module}>
    {children}
  </DashboardModuleContext.Provider>
);
