/**
 * Public API of the user-types feature. Other features and the app shell import ONLY from here.
 */
export {
  createUserTypesModule,
  type UserTypesModule,
  type UserTypesModuleDeps,
} from './user-types-module';
export {
  UserTypesModuleProvider,
  useUserTypes,
  useCreateUserType,
  userTypesQueryKey,
} from './presentation';
export type { UserType } from './domain';

// NOTE: UserTypesPage is intentionally NOT re-exported — the router lazy-loads it from its module path
// so it can be code-split into its own chunk.
