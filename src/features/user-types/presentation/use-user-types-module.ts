import { useContext } from 'react';
import type { UserTypesModule } from '../user-types-module';
import { UserTypesModuleContext } from './user-types-module-context';

/** Resolve the injected user-types use cases. Throws if used outside the provider. */
export const useUserTypesModule = (): UserTypesModule => {
  const module = useContext(UserTypesModuleContext);
  if (module === null) {
    throw new Error('UserTypes hooks must be used within <UserTypesModuleProvider>.');
  }
  return module;
};
