import type { ReactElement, ReactNode } from 'react';
import type { QuizzesModule } from '../quizzes-module';
import { QuizzesModuleContext } from './quizzes-module-context';

export interface QuizzesModuleProviderProps {
  readonly module: QuizzesModule;
  readonly children: ReactNode;
}

/** Provides the injected quizzes use cases to the React tree. Wiring lives in the composition root. */
export const QuizzesModuleProvider = ({
  module,
  children,
}: QuizzesModuleProviderProps): ReactElement => (
  <QuizzesModuleContext.Provider value={module}>{children}</QuizzesModuleContext.Provider>
);
