/**
 * Public API of the `quizzes` feature. The app shell and other features import ONLY from here.
 * Backed by an in-memory gateway seeded from prototype quizzes (swap for HTTP to go live).
 */
export {
  createQuizzesModule,
  type QuizzesModule,
  type QuizzesModuleDeps,
} from './quizzes-module';
export {
  QuizzesModuleProvider,
  QuizManagerModal,
  useQuizzes,
  useQuizPassed,
  quizzesQueryKey,
} from './presentation';
export { Quiz, QuizResult, type QuizContentKind } from './domain';
