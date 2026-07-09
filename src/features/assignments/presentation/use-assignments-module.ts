import { useContext } from 'react';
import type { AssignmentsModule } from '../assignments-module';
import { AssignmentsModuleContext } from './assignments-module-context';

/** Resolve the injected assignments use cases. Throws if used outside the provider. */
export const useAssignmentsModule = (): AssignmentsModule => {
  const module = useContext(AssignmentsModuleContext);
  if (module === null) {
    throw new Error('Assignments hooks must be used within <AssignmentsModuleProvider>.');
  }
  return module;
};
