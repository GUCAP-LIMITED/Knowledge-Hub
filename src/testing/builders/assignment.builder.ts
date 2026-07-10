import { Assignment, type AssignmentProps } from '@features/assignments/domain';

export type AssignmentOverrides = Partial<AssignmentProps>;

const DEFAULT_ASSIGNMENT: AssignmentProps = {
  id: 'as-1',
  course: 'Compliance & Legal Requirements',
  assignee: 'All Consultants',
  dueDate: new Date('2024-01-31T00:00:00.000Z'),
  status: 'active',
  progress: 0,
};

/** Construct a valid {@link Assignment} for tests, overriding only what matters per case. */
export const buildAssignment = (overrides: AssignmentOverrides = {}): Assignment =>
  new Assignment({ ...DEFAULT_ASSIGNMENT, ...overrides });
