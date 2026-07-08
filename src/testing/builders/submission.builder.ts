import { Submission, type SubmissionProps } from '@features/submissions/domain';

export type SubmissionOverrides = Partial<SubmissionProps>;

const DEFAULT_SUBMISSION: SubmissionProps = {
  id: 'sub-1',
  title: 'Updated CV Template',
  type: 'Document',
  submittedBy: 'Raj Ahmed',
  submittedAt: new Date('2024-01-20T00:00:00.000Z'),
  status: 'pending',
  note: null,
};

/** Construct a valid {@link Submission} for tests, overriding only what matters per case. */
export const buildSubmission = (overrides: SubmissionOverrides = {}): Submission =>
  new Submission({ ...DEFAULT_SUBMISSION, ...overrides });
