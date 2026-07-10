import type { Assignment } from '../domain';

export type AssignmentFilter = 'all' | 'active' | 'completed' | 'overdue';

export const ASSIGNMENT_TABS: readonly {
  readonly value: AssignmentFilter;
  readonly label: string;
}[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
];

const matchesQuery = (assignment: Assignment, q: string): boolean =>
  q === '' ||
  assignment.course.toLowerCase().includes(q) ||
  assignment.assignee.toLowerCase().includes(q);

/** Filter by status tab (using the live display status) and a course/assignee query. */
export const filterAssignments = (
  assignments: readonly Assignment[],
  tab: AssignmentFilter,
  query: string,
  now: Date,
): readonly Assignment[] => {
  const q = query.trim().toLowerCase();
  return assignments.filter(
    (assignment) =>
      (tab === 'all' || assignment.displayStatus(now) === tab) &&
      matchesQuery(assignment, q),
  );
};

/** Count of assignments in each tab, for the pill badges. */
export const assignmentTabCounts = (
  assignments: readonly Assignment[],
  now: Date,
): Record<AssignmentFilter, number> => ({
  all: assignments.length,
  active: assignments.filter((a) => a.displayStatus(now) === 'active').length,
  completed: assignments.filter((a) => a.displayStatus(now) === 'completed').length,
  overdue: assignments.filter((a) => a.displayStatus(now) === 'overdue').length,
});
