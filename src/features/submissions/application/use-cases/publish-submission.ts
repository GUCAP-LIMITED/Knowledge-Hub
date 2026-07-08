import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import type { Submission, SubmissionError, SubmissionGateway } from '../../domain';

export interface PublishSubmissionUseCaseDeps {
  readonly submissionGateway: SubmissionGateway;
  readonly logger: Logger;
}

/** Publish an approved submission so learners can see it. */
export class PublishSubmissionUseCase {
  private readonly submissionGateway: SubmissionGateway;
  private readonly logger: Logger;

  public constructor(deps: PublishSubmissionUseCaseDeps) {
    this.submissionGateway = deps.submissionGateway;
    this.logger = deps.logger.child('publish-submission');
  }

  public async execute(id: string): Promise<Result<Submission, SubmissionError>> {
    const found = await this.submissionGateway.getById(id);
    if (isErr(found)) {
      return found;
    }
    const published = found.value.publish();
    if (isErr(published)) {
      this.logger.warn('Publish rejected by domain', { id, code: published.error.code });
      return published;
    }
    return this.submissionGateway.save(published.value);
  }
}
