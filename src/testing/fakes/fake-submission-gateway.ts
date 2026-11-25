import { type Result, ok } from '@core/result';
import type {
  ApprovalStatusCounts,
  NewSubmissionInput,
  PagedSubmissionsResult,
  Submission,
  SubmissionError,
  SubmissionGateway,
  SubmissionQueryParams,
} from '@features/submissions/domain';
import { buildSubmission } from '../builders/submission.builder';

/** Hand-written, fully-typed fake of the {@link SubmissionGateway} port. */
export class FakeSubmissionGateway implements SubmissionGateway {
  public listResult: Result<readonly Submission[], SubmissionError> = ok([]);
  public listPagedResult: Result<PagedSubmissionsResult, SubmissionError> = ok({
    totalCount: 0,
    items: [],
  });
  public statusCountsResult: Result<ApprovalStatusCounts, SubmissionError> = ok({
    pending: 0,
    inReview: 0,
    approved: 0,
    published: 0,
    rejected: 0,
  });
  public getByIdResult: Result<Submission, SubmissionError> = ok(buildSubmission());
  public createResult: Result<Submission, SubmissionError> = ok(buildSubmission());
  public saveResult: Result<Submission, SubmissionError> = ok(buildSubmission());

  public lastCreated: NewSubmissionInput | null = null;
  public lastSaved: Submission | null = null;
  public lastRequestedId: string | null = null;
  public lastQueryParams: SubmissionQueryParams | null = null;

  public list(): Promise<Result<readonly Submission[], SubmissionError>> {
    return Promise.resolve(this.listResult);
  }

  public listPaged(
    params: SubmissionQueryParams,
  ): Promise<Result<PagedSubmissionsResult, SubmissionError>> {
    this.lastQueryParams = params;
    return Promise.resolve(this.listPagedResult);
  }

  public getStatusCounts(
    _params: Pick<SubmissionQueryParams, 'filter' | 'type'>,
  ): Promise<Result<ApprovalStatusCounts, SubmissionError>> {
    return Promise.resolve(this.statusCountsResult);
  }

  public getById(id: string): Promise<Result<Submission, SubmissionError>> {
    this.lastRequestedId = id;
    return Promise.resolve(this.getByIdResult);
  }

  public create(input: NewSubmissionInput): Promise<Result<Submission, SubmissionError>> {
    this.lastCreated = input;
    return Promise.resolve(this.createResult);
  }

  public save(submission: Submission): Promise<Result<Submission, SubmissionError>> {
    this.lastSaved = submission;
    return Promise.resolve(this.saveResult);
  }
}
