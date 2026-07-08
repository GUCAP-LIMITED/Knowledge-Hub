/**
 * Public API of the `tutorials` feature. The app shell and other features import ONLY from here.
 * Backed by an in-memory gateway seeded from the prototype library (swap for HTTP to go live).
 */
export {
  createTutorialsModule,
  type TutorialsModule,
  type TutorialsModuleDeps,
} from './tutorials-module';
export { TutorialsModuleProvider, useTutorials, tutorialsQueryKey } from './presentation';
export { Tutorial, type TutorialProps } from './domain';
