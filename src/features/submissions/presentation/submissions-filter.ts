import type { CategoryKind } from '@features/content';

export type SubmissionTypeFilter = 'all' | CategoryKind;
export type SubmissionStatusFilter =
  | 'all'
  | 'pendingReview'
  | 'inReview'
  | 'approved'
  | 'published'
  | 'rejected';
export type SubmissionSortFilter = 'newest' | 'oldest';

export const TYPE_OPTIONS: readonly {
  readonly value: SubmissionTypeFilter;
  readonly label: string;
}[] = [
  { value: 'all', label: 'All types' },
  { value: 'course', label: 'Course' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'resource', label: 'Resource' },
];

export const STATUS_OPTIONS: readonly {
  readonly value: SubmissionStatusFilter;
  readonly label: string;
}[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'pendingReview', label: 'Pending Review' },
  { value: 'inReview', label: 'In Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'published', label: 'Published' },
  { value: 'rejected', label: 'Rejected' },
];

export const SORT_OPTIONS: readonly {
  readonly value: SubmissionSortFilter;
  readonly label: string;
}[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
];

/** Admins default to browsing published content; authors default to seeing all of their own. */
export const defaultStatus = (isAdmin: boolean): SubmissionStatusFilter =>
  isAdmin ? 'published' : 'all';
