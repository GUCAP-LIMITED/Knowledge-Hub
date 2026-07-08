import { useContext } from 'react';
import type { CoursesModule } from '../courses-module';
import { CoursesModuleContext } from './courses-module-context';

/** Resolve the injected courses use cases. Throws if used outside the provider. */
export const useCoursesModule = (): CoursesModule => {
  const module = useContext(CoursesModuleContext);
  if (module === null) {
    throw new Error('Courses hooks must be used within <CoursesModuleProvider>.');
  }
  return module;
};
