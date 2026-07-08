import { useContext } from 'react';
import type { SubmissionsModule } from '../submissions-module';
import { SubmissionsModuleContext } from './submissions-module-context';

/** Resolve the injected submissions use cases. Throws if used outside the provider. */
export const useSubmissionsModule = (): SubmissionsModule => {
  const module = useContext(SubmissionsModuleContext);
  if (module === null) {
    throw new Error('Submissions hooks must be used within <SubmissionsModuleProvider>.');
  }
  return module;
};
