import { useContext } from 'react';
import type { UsersModule } from '../users-module';
import { UsersModuleContext } from './users-module-context';

/** Resolve the injected users use cases. Throws if used outside the provider. */
export const useUsersModule = (): UsersModule => {
  const module = useContext(UsersModuleContext);
  if (module === null) {
    throw new Error('Users hooks must be used within <UsersModuleProvider>.');
  }
  return module;
};
