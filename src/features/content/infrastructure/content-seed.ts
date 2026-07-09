import type { ContentItemProps } from '../domain';

/**
 * Seed library ported from the original Knowledge Hub prototype. This is the in-memory data source
 * standing in for a backend. Swapping to a real API is a matter of binding an `HttpContentGateway`
 * (Zod DTO + mapper) in the feature module — no domain/application/presentation change.
 */
export const CONTENT_SEED: readonly ContentItemProps[] = [
  {
    id: 'ct-1',
    title: 'Getting Started with UAPP Portal',
    type: 'Course',
    status: 'published',
    author: 'Md Shamim',
    createdAt: new Date('2024-01-05'),
    views: 2456,
  },
  {
    id: 'ct-2',
    title: 'Submitting Your First Application',
    type: 'Tutorial',
    status: 'published',
    author: 'Raj Ahmed',
    createdAt: new Date('2024-01-14'),
    views: 1832,
  },
  {
    id: 'ct-3',
    title: 'Understanding Compliance Deadlines',
    type: 'Article',
    status: 'review',
    author: 'Fatima Noor',
    createdAt: new Date('2024-02-02'),
    views: 214,
  },
  {
    id: 'ct-4',
    title: 'Data Protection Policy 2024',
    type: 'Document',
    status: 'published',
    author: 'Sara Khan',
    createdAt: new Date('2024-02-11'),
    views: 987,
  },
  {
    id: 'ct-5',
    title: 'Onboarding Checklist Template',
    type: 'Resource',
    status: 'draft',
    author: 'Md Shamim',
    createdAt: new Date('2024-03-01'),
    views: 0,
  },
  {
    id: 'ct-6',
    title: 'Advanced Reporting Walkthrough',
    type: 'Tutorial',
    status: 'draft',
    author: 'Raj Ahmed',
    createdAt: new Date('2024-03-09'),
    views: 41,
  },
];
