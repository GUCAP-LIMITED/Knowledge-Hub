import type { SubmissionProps } from '../domain';

/**
 * Seed queue ported from the prototype, spanning every status so the review workflow is visible.
 * Swap `InMemorySubmissionGateway` for an HTTP adapter to persist against a real service.
 */
export const SUBMISSION_SEED: readonly SubmissionProps[] = [
  {
    id: 'sub-1',
    title: 'Updated CV Template',
    type: 'Document',
    submittedBy: 'Raj Ahmed',
    submittedAt: new Date('2024-01-20'),
    status: 'pending',
    note: null,
  },
  {
    id: 'sub-2',
    title: 'Onboarding Walkthrough Video',
    type: 'Video',
    submittedBy: 'Raj Ahmed',
    submittedAt: new Date('2024-01-19'),
    status: 'review',
    note: null,
  },
  {
    id: 'sub-3',
    title: 'Q1 Sales Targets',
    type: 'Spreadsheet',
    submittedBy: 'Emma Wilson',
    submittedAt: new Date('2024-01-18'),
    status: 'approved',
    note: 'Looks good — clear breakdown by region.',
  },
  {
    id: 'sub-4',
    title: 'Compliance Refresher',
    type: 'Course',
    submittedBy: 'Emma Wilson',
    submittedAt: new Date('2024-01-15'),
    status: 'published',
    note: null,
  },
  {
    id: 'sub-5',
    title: 'Outdated Policy Draft',
    type: 'Document',
    submittedBy: 'Raj Ahmed',
    submittedAt: new Date('2024-01-12'),
    status: 'rejected',
    note: 'Superseded by the January policy update — please resubmit against the new template.',
  },
];
