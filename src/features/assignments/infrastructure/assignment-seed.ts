import type { AssignmentProps } from '../domain';

/**
 * Seed assignments ported from the prototype, spanning every status so the tracker is visible.
 * Swap `InMemoryAssignmentGateway` for an HTTP adapter to persist against a real service.
 */
export const ASSIGNMENT_SEED: readonly AssignmentProps[] = [
  {
    id: 'as-1',
    course: 'Compliance & Legal Requirements',
    assignee: 'All Consultants',
    dueDate: new Date('2024-01-31'),
    status: 'active',
  },
  {
    id: 'as-2',
    course: 'Getting Started with UAPP Portal',
    assignee: 'New Starters',
    dueDate: new Date('2024-02-15'),
    status: 'completed',
  },
  {
    id: 'as-3',
    course: 'Advanced Sales Techniques',
    assignee: 'Sales Team',
    dueDate: new Date('2023-12-01'),
    status: 'overdue',
  },
  {
    id: 'as-4',
    course: 'Leadership Essentials',
    assignee: 'Team Leads',
    dueDate: new Date('2024-03-10'),
    status: 'active',
  },
];
