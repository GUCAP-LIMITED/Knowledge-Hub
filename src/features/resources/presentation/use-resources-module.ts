import { useContext } from 'react';
import type { ResourcesModule } from '../resources-module';
import { ResourcesModuleContext } from './resources-module-context';

/** Resolve the injected resources use cases. Throws if used outside the provider. */
export const useResourcesModule = (): ResourcesModule => {
  const module = useContext(ResourcesModuleContext);
  if (module === null) {
    throw new Error('Resources hooks must be used within <ResourcesModuleProvider>.');
  }
  return module;
};
