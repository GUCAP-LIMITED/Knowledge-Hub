import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import {
  type Submission,
  type SubmissionError,
  type SubmissionGateway,
  type SubmissionStatus,
  SubmissionTitle,
} from '../../domain';

export interface SubmitContentInput {
  readonly title: string;
  readonly type: string;
  readonly submittedBy: string;
  /** Admins publish directly; everyone else submits for review. */
  readonly publishDirectly: boolean;
}

export interface SubmitContentUseCaseDeps {
  readonly submissionGateway: SubmissionGateway;
  readonly logger: Logger;
}

/**
 * Create a submission from an upload. Validates the title via the domain value object, then applies
 * the business rule that admins publish directly while everyone else enters the review queue.
 */
export class SubmitContentUseCase {
  private readonly submissionGateway: SubmissionGateway;
  private readonly logger: Logger;

  public constructor(deps: SubmitContentUseCaseDeps) {
    this.submissionGateway = deps.submissionGateway;
    this.logger = deps.logger.child('submit-content');
  }

  public async execute(
    input: SubmitContentInput,
  ): Promise<Result<Submission, SubmissionError>> {
    const title = SubmissionTitle.create(input.title);
    if (isErr(title)) {
      this.logger.warn('Rejected invalid submission title', { code: title.error.code });
      return title;
    }

    const status: SubmissionStatus = input.publishDirectly ? 'published' : 'pending';
    const result = await this.submissionGateway.create({
      title: title.value.value,
      type: input.type,
      submittedBy: input.submittedBy,
      status,
    });
    if (isErr(result)) {
      this.logger.warn('Creating submission failed', { code: result.error.code });
      return result;
    }

    this.logger.info('Submission created', { id: result.value.id, status });
    return result;
  }
}
