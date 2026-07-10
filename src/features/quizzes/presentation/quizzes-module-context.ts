import { createContext } from 'react';
import type { QuizzesModule } from '../quizzes-module';

/** Holds the DI-built quizzes module. Populated by `QuizzesModuleProvider` at the composition root. */
export const QuizzesModuleContext = createContext<QuizzesModule | null>(null);
