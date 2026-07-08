import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import {
  type Submission,
  type SubmissionError,
  type SubmissionGateway,
  RejectionReason,
} from '../../domain';

export interface RejectSubmissionUseCaseDeps {
  readonly submissionGateway: SubmissionGateway;
  readonly logger: Logger;
}

/** Reject a submission. The reason is validated as a value object before any state change. */
export class RejectSubmissionUseCase {
  private readonly submissionGateway: SubmissionGateway;
  private readonly logger: Logger;

  public constructor(deps: RejectSubmissionUseCaseDeps) {
    this.submissionGateway = deps.submissionGateway;
    this.logger = deps.logger.child('reject-submission');
  }

  public async execute(
    id: string,
    rawReason: string,
  ): Promise<Result<Submission, SubmissionError>> {
    const reason = RejectionReason.create(rawReason);
    if (isErr(reason)) {
      this.logger.warn('Rejected invalid rejection reason', {
        id,
        code: reason.error.code,
      });
      return reason;
    }
    const found = await this.submissionGateway.getById(id);
    if (isErr(found)) {
      return found;
    }
    const rejected = found.value.reject(reason.value);
    if (isErr(rejected)) {
      this.logger.warn('Reject rejected by domain', { id, code: rejected.error.code });
      return rejected;
    }
    return this.submissionGateway.save(rejected.value);
  }
}
