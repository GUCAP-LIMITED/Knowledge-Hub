import { type Result, isErr, ok } from '@core/result';
import type { Logger } from '@core/logger';
import type { Submission, SubmissionError, SubmissionGateway } from '../../domain';

export interface ListMySubmissionsUseCaseDeps {
  readonly submissionGateway: SubmissionGateway;
  readonly logger: Logger;
}

/** Fetch only the submissions created by a given user (their "My submissions" view). */
export class ListMySubmissionsUseCase {
  private readonly submissionGateway: SubmissionGateway;
  private readonly logger: Logger;

  public constructor(deps: ListMySubmissionsUseCaseDeps) {
    this.submissionGateway = deps.submissionGateway;
    this.logger = deps.logger.child('list-my-submissions');
  }

  public async execute(
    submittedBy: string,
  ): Promise<Result<readonly Submission[], SubmissionError>> {
    const result = await this.submissionGateway.list();
    if (isErr(result)) {
      this.logger.warn('Listing submissions failed', { code: result.error.code });
      return result;
    }
    const mine = result.value.filter(
      (submission) => submission.submittedBy === submittedBy,
    );
    return ok(mine);
  }
}
