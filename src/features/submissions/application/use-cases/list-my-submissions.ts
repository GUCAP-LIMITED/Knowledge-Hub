import { type Result, isErr, ok } from '@core/result';
import type { Logger } from '@core/logger';
import type {
  Submission,
  SubmissionError,
  SubmissionGateway,
  SubmissionQueryParams,
} from '../../domain';

export interface ListMySubmissionsUseCaseDeps {
  readonly submissionGateway: SubmissionGateway;
  readonly logger: Logger;
}

/** The default page size for "my submissions" — a working set, not an archive. */
const MAX_RESULT_COUNT = 200;

/**
 * Fetch only the submissions created by a given user (their "My submissions" view).
 * The Content API has no server-side "owner" filter, so search/type/status/category filters
 * are applied server-side and the owner scope is enforced client-side afterwards — a learner
 * must never see another author's submissions, regardless of the filters they pick.
 */
export class ListMySubmissionsUseCase {
  private readonly submissionGateway: SubmissionGateway;
  private readonly logger: Logger;

  public constructor(deps: ListMySubmissionsUseCaseDeps) {
    this.submissionGateway = deps.submissionGateway;
    this.logger = deps.logger.child('list-my-submissions');
  }

  public async execute(
    submittedBy: string,
    params?: Omit<SubmissionQueryParams, 'skipCount' | 'maxResultCount'>,
  ): Promise<Result<readonly Submission[], SubmissionError>> {
    const result = await this.submissionGateway.listPaged({
      ...params,
      skipCount: 0,
      maxResultCount: MAX_RESULT_COUNT,
    });
    if (isErr(result)) {
      this.logger.warn('Listing submissions failed', { code: result.error.code });
      return result;
    }
    const mine = result.value.items.filter(
      (submission) => submission.submittedBy === submittedBy,
    );
    return ok(mine);
  }
}
