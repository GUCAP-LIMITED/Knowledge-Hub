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
    description: 'Create a student record and enrol them onto the right programme.',
    updatedAt: new Date('2026-07-06T09:00:00.000Z'),
  },
  {
    id: 'tutorial-2',
    title: 'Submitting an Application',
    category: 'Applications',
    duration: '8 min',
    views: 982,
    difficulty: 'Beginner',
    description: 'Fill in the form, attach supporting documents and submit for review.',
    updatedAt: new Date('2026-07-01T09:00:00.000Z'),
  },
  {
    id: 'tutorial-3',
    title: 'Uploading Supporting Documents',
    category: 'Documents',
    duration: '6 min',
    views: 731,
    difficulty: 'Intermediate',
    description: 'Attach evidence to an application and check accepted file types.',
    updatedAt: new Date('2026-06-20T09:00:00.000Z'),
  },
  {
    id: 'tutorial-4',
    title: 'Building a Custom Report',
    category: 'Reports',
    duration: '12 min',
    views: 564,
    difficulty: 'Advanced',
    description: 'Combine filters and columns to build and export a tailored report.',
    updatedAt: new Date('2026-05-15T09:00:00.000Z'),
  },
  {
    id: 'tutorial-5',
    title: 'Configuring Notification Settings',
    category: 'Settings',
    duration: '4 min',
    views: 419,
    difficulty: 'Beginner',
    description: 'Choose which emails and in-app alerts you and your team receive.',
    updatedAt: new Date('2026-07-08T09:00:00.000Z'),
  },
  {
    id: 'tutorial-6',
    title: 'Managing Application Statuses',
    category: 'Applications',
    duration: '10 min',
    views: 638,
    difficulty: 'Intermediate',
    description: 'Move applications through each stage and keep applicants informed.',
    updatedAt: new Date('2026-04-02T09:00:00.000Z'),
  },
];
