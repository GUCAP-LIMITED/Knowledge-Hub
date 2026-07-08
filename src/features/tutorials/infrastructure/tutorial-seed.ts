import type { TutorialProps } from '../domain';

/**
 * Seed library ported from the original Knowledge Hub prototype. This is the in-memory data source
 * standing in for a backend. Swapping to a real API is a matter of binding an `HttpTutorialGateway`
 * (Zod DTO + mapper) in the feature module — no domain/application/presentation change.
 */
export const TUTORIAL_SEED: readonly TutorialProps[] = [
  {
    id: 'tutorial-1',
    title: 'Adding a Student',
    category: 'Students',
    duration: '5 min',
    views: 1245,
    difficulty: 'Beginner',
  },
  {
    id: 'tutorial-2',
    title: 'Submitting an Application',
    category: 'Applications',
    duration: '8 min',
    views: 982,
    difficulty: 'Beginner',
  },
  {
    id: 'tutorial-3',
    title: 'Uploading Supporting Documents',
    category: 'Documents',
    duration: '6 min',
    views: 731,
    difficulty: 'Intermediate',
  },
  {
    id: 'tutorial-4',
    title: 'Building a Custom Report',
    category: 'Reports',
    duration: '12 min',
    views: 564,
    difficulty: 'Advanced',
  },
  {
    id: 'tutorial-5',
    title: 'Configuring Notification Settings',
    category: 'Settings',
    duration: '4 min',
    views: 419,
    difficulty: 'Beginner',
  },
  {
    id: 'tutorial-6',
    title: 'Managing Application Statuses',
    category: 'Applications',
    duration: '10 min',
    views: 638,
    difficulty: 'Intermediate',
  },
];
