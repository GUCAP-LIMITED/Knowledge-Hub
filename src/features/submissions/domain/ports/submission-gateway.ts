import type { Result } from '@core/result';
import type { SubmissionError } from '../errors/submission-errors';
import type { Submission, SubmissionStatus } from '../entities/submission';

/** The data a new submission carries at creation; the gateway assigns id + timestamp. */
export interface NewSubmissionInput {
  readonly title: string;
  readonly type: string;
  readonly submittedBy: string;
  readonly status: SubmissionStatus;
}

/**
 * Port to the submissions store. The domain states the contract in its own terms (`Submission`);
 * persistence details live in an infrastructure implementation. Dependency Inversion seam.
 */
export interface SubmissionGateway {
  /** Fetch every submission (reviewers see the whole queue). */
  list(): Promise<Result<readonly Submission[], SubmissionError>>;

  /** Fetch a single submission by id. */
  getById(id: string): Promise<Result<Submission, SubmissionError>>;

  /** Create a new submission and return it (with a generated id + timestamp). */
  create(input: NewSubmissionInput): Promise<Result<Submission, SubmissionError>>;

  /** Persist an updated submission (after a domain transition) and return it. */
  save(submission: Submission): Promise<Result<Submission, SubmissionError>>;
}
