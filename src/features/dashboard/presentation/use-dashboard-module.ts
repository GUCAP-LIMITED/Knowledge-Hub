import { useContext } from 'react';
import type { DashboardModule } from '../dashboard-module';
import { DashboardModuleContext } from './dashboard-module-context';

/** Resolve the injected dashboard use cases. Throws if used outside the provider. */
export const useDashboardModule = (): DashboardModule => {
  const module = useContext(DashboardModuleContext);
  if (module === null) {
    throw new Error('Dashboard hooks must be used within <DashboardModuleProvider>.');
  }
  return module;
};
