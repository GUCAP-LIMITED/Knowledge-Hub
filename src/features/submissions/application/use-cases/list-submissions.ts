import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { Submission, SubmissionError, SubmissionGateway } from '../../domain';

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
}
