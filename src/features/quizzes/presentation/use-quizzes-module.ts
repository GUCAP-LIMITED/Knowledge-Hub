import { useContext } from 'react';
import type { QuizzesModule } from '../quizzes-module';
import { QuizzesModuleContext } from './quizzes-module-context';

/** Resolve the injected quizzes use cases. Throws if used outside the provider. */
export const useQuizzesModule = (): QuizzesModule => {
  const module = useContext(QuizzesModuleContext);
  if (module === null) {
    throw new Error('Quizzes hooks must be used within <QuizzesModuleProvider>.');
  }
  return module;
};
