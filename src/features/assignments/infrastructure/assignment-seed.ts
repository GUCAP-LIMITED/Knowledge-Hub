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
    dueDate: new Date('2026-07-24'),
    status: 'active',
    progress: 62,
  },
  {
    id: 'as-2',
    course: 'Getting Started with UAPP Portal',
    assignee: 'New Starters',
    dueDate: new Date('2026-06-15'),
    status: 'completed',
    progress: 100,
  },
  {
    id: 'as-3',
    course: 'Advanced Sales Techniques',
    assignee: 'Sales Team',
    dueDate: new Date('2026-06-20'),
    status: 'overdue',
    progress: 34,
  },
  {
    id: 'as-4',
    course: 'Leadership Essentials',
    assignee: 'Team Leads',
    dueDate: new Date('2026-08-12'),
    status: 'active',
    progress: 18,
  },
];
