/**
 * Public API of the `assignments` feature — assign courses to the team and track completion.
 * Backed by an in-memory gateway seeded from the prototype (swap for HTTP to go live).
 */
export {
  createAssignmentsModule,
  type AssignmentsModule,
  type AssignmentsModuleDeps,
} from './assignments-module';
export {
  AssignmentsModuleProvider,
  useAssignments,
  useInfiniteAssignments,
  ASSIGNMENTS_PAGE_SIZE,
  useCreateAssignment,
  useDeleteAssignment,
  useAssignableUsers,
  assignmentsQueryKey,
} from './presentation';
export { Assignment, type AssignmentProps } from './domain';
