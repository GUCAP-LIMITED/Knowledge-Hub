import type { ReviewProps } from '../domain';

/** Courses a learner may review. Kept feature-local (denormalised) to avoid coupling to `courses`. */
export const REVIEWABLE_COURSES: readonly {
  readonly id: string;
  readonly name: string;
}[] = [
  { id: 'course-1', name: 'Getting Started with UAPP Portal' },
  { id: 'course-2', name: 'Compliance & Legal Requirements' },
  { id: 'course-3', name: 'Advanced Sales Techniques' },
  { id: 'course-4', name: 'Marketing Fundamentals' },
  { id: 'course-5', name: 'Operations Playbook' },
  { id: 'course-6', name: 'Leadership Essentials' },
];

/** Seed reviews ported from the prototype (deterministic `courseId:userId` ids). */
export const REVIEW_SEED: readonly ReviewProps[] = [
  {
    id: 'course-1:admin',
    courseId: 'course-1',
    courseName: 'Getting Started with UAPP Portal',
    userId: 'admin',
    userName: 'Md Shamim',
    userRole: 'Administrator',
    rating: 5,
    feedback: 'Excellent intro to the UAPP portal. Covers everything a new joiner needs.',
    createdAt: new Date('2024-01-10'),
    helpful: 12,
  },
  {
    id: 'course-1:mgr1',
    courseId: 'course-1',
    courseName: 'Getting Started with UAPP Portal',
    userId: 'mgr1',
    userName: 'Raj Ahmed',
    userRole: 'Admission Manager',
    rating: 4,
    feedback: 'Clear and practical. Would love a section on bulk imports.',
    createdAt: new Date('2024-01-14'),
    helpful: 5,
  },
  {
    id: 'course-2:cons1',
    courseId: 'course-2',
    courseName: 'Compliance & Legal Requirements',
    userId: 'cons1',
    userName: 'Simona',
    userRole: 'Consultant',
    rating: 5,
    feedback: 'Dense but essential. The examples made the regulations click.',
    createdAt: new Date('2024-01-16'),
    helpful: 8,
  },
  {
    id: 'course-3:cons1',
    courseId: 'course-3',
    courseName: 'Advanced Sales Techniques',
    userId: 'cons1',
    userName: 'Simona',
    userRole: 'Consultant',
    rating: 4,
    feedback: 'Great objection-handling tips I already use on calls.',
    createdAt: new Date('2024-01-22'),
    helpful: 3,
  },
];
