import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import type { Submission, SubmissionError, SubmissionGateway } from '../../domain';

export interface FlagSubmissionUseCaseDeps {
  readonly submissionGateway: SubmissionGateway;
  readonly logger: Logger;
}

/** Move a pending submission into deeper review. */
export class FlagSubmissionUseCase {
  private readonly submissionGateway: SubmissionGateway;
  private readonly logger: Logger;

  public constructor(deps: FlagSubmissionUseCaseDeps) {
    this.submissionGateway = deps.submissionGateway;
    this.logger = deps.logger.child('flag-submission');
  }

  public async execute(id: string): Promise<Result<Submission, SubmissionError>> {
    const found = await this.submissionGateway.getById(id);
    if (isErr(found)) {
      return found;
    }
    const flagged = found.value.flagForReview();
    if (isErr(flagged)) {
      this.logger.warn('Flag rejected by domain', { id, code: flagged.error.code });
      return flagged;
    }
    return this.submissionGateway.save(flagged.value);
  }
}
