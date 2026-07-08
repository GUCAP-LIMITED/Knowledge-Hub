import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import type { Submission, SubmissionError, SubmissionGateway } from '../../domain';

export interface ApproveSubmissionUseCaseDeps {
  readonly submissionGateway: SubmissionGateway;
  readonly logger: Logger;
}

/** Approve a submission awaiting decision. The domain enforces the legal transition. */
export class ApproveSubmissionUseCase {
  private readonly submissionGateway: SubmissionGateway;
  private readonly logger: Logger;

  public constructor(deps: ApproveSubmissionUseCaseDeps) {
    this.submissionGateway = deps.submissionGateway;
    this.logger = deps.logger.child('approve-submission');
  }

  public async execute(
    id: string,
    note?: string,
  ): Promise<Result<Submission, SubmissionError>> {
    const found = await this.submissionGateway.getById(id);
    if (isErr(found)) {
      return found;
    }
    const approved = found.value.approve(note);
    if (isErr(approved)) {
      this.logger.warn('Approve rejected by domain', { id, code: approved.error.code });
      return approved;
    }
    return this.submissionGateway.save(approved.value);
  }
}
