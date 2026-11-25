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
