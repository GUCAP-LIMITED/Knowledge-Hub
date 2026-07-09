import type { UserAccountProps } from '../domain';

/**
 * Seed directory ported from the original Knowledge Hub prototype. This is the in-memory data
 * source standing in for a backend. Swapping to a real API is a matter of binding an
 * `HttpUserGateway` (Zod DTO + mapper) in the feature module — no domain/application/presentation
 * change.
 */
export const USER_SEED: readonly UserAccountProps[] = [
  {
    id: 'admin',
    name: 'Md Shamim',
    email: 'admin@uapp.com',
    role: 'admin',
    status: 'active',
    joined: 'Oct 2023',
    lastActive: '2 hours ago',
  },
  {
    id: 'manager',
    name: 'Raj Ahmed',
    email: 'manager@uapp.com',
    role: 'manager',
    status: 'active',
    joined: 'Nov 2023',
    lastActive: '1 day ago',
  },
  {
    id: 'consultant',
    name: 'Simona',
    email: 'consultant@uapp.com',
    role: 'consultant',
    status: 'active',
    joined: 'Jan 2024',
    lastActive: '3 hours ago',
  },
  {
    id: 'user-4',
    name: 'Priya Nair',
    email: 'priya@uapp.com',
    role: 'manager',
    status: 'active',
    joined: 'Feb 2024',
    lastActive: 'Just now',
  },
  {
    id: 'user-5',
    name: 'Marcus Bell',
    email: 'marcus@uapp.com',
    role: 'consultant',
    status: 'active',
    joined: 'Mar 2024',
    lastActive: '5 hours ago',
  },
  {
    id: 'user-6',
    name: 'Tom Fischer',
    email: 'tom@uapp.com',
    role: 'consultant',
    status: 'inactive',
    joined: 'Apr 2024',
    lastActive: '3 weeks ago',
  },
];
