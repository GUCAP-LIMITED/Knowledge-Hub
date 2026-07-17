import { useContext } from 'react';
import type { HierarchyModule } from '../hierarchy-module';
import { HierarchyModuleContext } from './hierarchy-module-context';

/** Resolve the injected hierarchy use cases. Throws if used outside the provider. */
export const useHierarchyModule = (): HierarchyModule => {
  const module = useContext(HierarchyModuleContext);
  if (module === null) {
    throw new Error('Hierarchy hooks must be used within <HierarchyModuleProvider>.');
  }
  return module;
};
