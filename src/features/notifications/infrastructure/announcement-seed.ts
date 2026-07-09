import type { AnnouncementProps } from '../domain';

/** Seed announcements ported from the prototype. */
export const ANNOUNCEMENT_SEED: readonly AnnouncementProps[] = [
  {
    id: 'an-1',
    title: 'New Training Module Available',
    content:
      'We have launched a new compliance training module. All consultants must complete it by end of month.',
    priority: 'high',
    author: 'Md Shamim',
    date: 'Jan 20, 2024',
    read: false,
  },
  {
    id: 'an-2',
    title: 'Q1 Goals Announced',
    content:
      'Please review the Q1 targets shared in the team space and align your plans.',
    priority: 'medium',
    author: 'Md Shamim',
    date: 'Jan 18, 2024',
    read: false,
  },
  {
    id: 'an-3',
    title: 'Maintenance window this weekend',
    content:
      'The portal will be briefly unavailable on Saturday night for scheduled maintenance.',
    priority: 'normal',
    author: 'IT Team',
    date: 'Jan 15, 2024',
    read: true,
  },
];
