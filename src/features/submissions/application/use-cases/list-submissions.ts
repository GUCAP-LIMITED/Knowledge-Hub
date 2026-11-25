import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type {
  ApprovalStatusCounts,
  PagedSubmissionsResult,
  Submission,
  SubmissionError,
  SubmissionGateway,
  SubmissionQueryParams,
} from '../../domain';

export interface ListSubmissionsUseCaseDeps {
  readonly submissionGateway: SubmissionGateway;
  readonly logger: Logger;
}

/** Fetch every submission (the reviewer queue). Pure orchestration. */
export class ListSubmissionsUseCase {
  private readonly submissionGateway: SubmissionGateway;
  private readonly logger: Logger;

  public constructor(deps: ListSubmissionsUseCaseDeps) {
    this.submissionGateway = deps.submissionGateway;
    this.logger = deps.logger.child('list-submissions');
  }

  public async execute(): Promise<Result<readonly Submission[], SubmissionError>> {
    const result = await this.submissionGateway.list();
    if (!result.ok) {
      this.logger.warn('Listing submissions failed', { code: result.error.code });
    }
    return result;
  }

  public async executePaged(
    params: SubmissionQueryParams,
  ): Promise<Result<PagedSubmissionsResult, SubmissionError>> {
    const result = await this.submissionGateway.listPaged(params);
    if (!result.ok) {
      this.logger.warn('Listing paged submissions failed', { code: result.error.code });
    }
    return result;
  }

  public async getStatusCounts(
    params: Pick<SubmissionQueryParams, 'filter' | 'type'>,
  ): Promise<Result<ApprovalStatusCounts, SubmissionError>> {
    const result = await this.submissionGateway.getStatusCounts(params);
    if (!result.ok) {
      this.logger.warn('Getting approval status counts failed', {
        code: result.error.code,
      });
    }
    return result;
  }
}
