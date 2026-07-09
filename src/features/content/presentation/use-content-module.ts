import { useContext } from 'react';
import type { ContentModule } from '../content-module';
import { ContentModuleContext } from './content-module-context';

/** Resolve the injected content use cases. Throws if used outside the provider. */
export const useContentModule = (): ContentModule => {
  const module = useContext(ContentModuleContext);
  if (module === null) {
    throw new Error('Content hooks must be used within <ContentModuleProvider>.');
  }
  return module;
};
