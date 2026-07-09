import type { TeamMemberProps } from '../domain';

/**
 * Seed roster ported from the original Knowledge Hub prototype. This is the in-memory data source
 * standing in for a backend. Swapping to a real API is a matter of binding an `HttpTeamGateway`
 * (Zod DTO + mapper) in the feature module — no domain/application/presentation change.
 */
export const TEAM_SEED: readonly TeamMemberProps[] = [
  {
    id: 'tm-1',
    name: 'Simona',
    email: 'simona@uapp.com',
    role: 'Consultant',
    progress: 85,
    completed: 4,
    total: 5,
    lastActive: '2 hours ago',
    status: 'online',
  },
  {
    id: 'tm-2',
    name: 'Marcus Bell',
    email: 'marcus@uapp.com',
    role: 'Sales Lead',
    progress: 62,
    completed: 3,
    total: 5,
    lastActive: '5 hours ago',
    status: 'away',
  },
  {
    id: 'tm-3',
    name: 'Priya Nair',
    email: 'priya@uapp.com',
    role: 'Compliance Officer',
    progress: 95,
    completed: 6,
    total: 6,
    lastActive: 'Just now',
    status: 'online',
  },
  {
    id: 'tm-4',
    name: 'Tom Fischer',
    email: 'tom@uapp.com',
    role: 'Operations Analyst',
    progress: 28,
    completed: 1,
    total: 5,
    lastActive: '2 days ago',
    status: 'offline',
  },
  {
    id: 'tm-5',
    name: 'Amara Okoye',
    email: 'amara@uapp.com',
    role: 'Marketing Manager',
    progress: 47,
    completed: 2,
    total: 4,
    lastActive: '1 day ago',
    status: 'away',
  },
  {
    id: 'tm-6',
    name: 'Liam Walsh',
    email: 'liam@uapp.com',
    role: 'Onboarding Specialist',
    progress: 12,
    completed: 0,
    total: 4,
    lastActive: '4 days ago',
    status: 'offline',
  },
];
