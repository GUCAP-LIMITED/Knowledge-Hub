import { useContext } from 'react';
import type { PermissionsModule } from '../permissions-module';
import { PermissionsModuleContext } from './permissions-module-context';

/** Resolve the injected permissions use cases. Throws if used outside the provider. */
export const usePermissionsModule = (): PermissionsModule => {
  const module = useContext(PermissionsModuleContext);
  if (module === null) {
    throw new Error('Permissions hooks must be used within <PermissionsModuleProvider>.');
  }
  return module;
};
