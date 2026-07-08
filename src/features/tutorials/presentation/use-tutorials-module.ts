import { useContext } from 'react';
import type { TutorialsModule } from '../tutorials-module';
import { TutorialsModuleContext } from './tutorials-module-context';

/** Resolve the injected tutorials use cases. Throws if used outside the provider. */
export const useTutorialsModule = (): TutorialsModule => {
  const module = useContext(TutorialsModuleContext);
  if (module === null) {
    throw new Error('Tutorials hooks must be used within <TutorialsModuleProvider>.');
  }
  return module;
};
