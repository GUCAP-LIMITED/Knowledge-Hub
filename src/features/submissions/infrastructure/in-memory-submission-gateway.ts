import type { Logger } from '@core/logger';
import type { Clock } from '@core/time';
import { type Result, ok, err } from '@core/result';
import {
  type NewSubmissionInput,
  Submission,
  type SubmissionError,
  type SubmissionGateway,
  SubmissionNotFoundError,
} from '../domain';
import { SUBMISSION_SEED } from './submission-seed';

export interface InMemorySubmissionGatewayDeps {
  readonly clock: Clock;
  readonly logger: Logger;
}

/** In-memory {@link SubmissionGateway} seeded from the prototype queue. */
export class InMemorySubmissionGateway implements SubmissionGateway {
  private readonly clock: Clock;
  private readonly logger: Logger;
  private readonly submissions: Map<string, Submission>;
  private counter: number;

  public constructor(deps: InMemorySubmissionGatewayDeps) {
    this.clock = deps.clock;
    this.logger = deps.logger.child('submission-gateway');
    this.submissions = new Map(
      SUBMISSION_SEED.map((props) => [props.id, new Submission(props)]),
    );
    this.counter = SUBMISSION_SEED.length;
  }

  public list(): Promise<Result<readonly Submission[], SubmissionError>> {
    return Promise.resolve(ok([...this.submissions.values()]));
  }

  public getById(id: string): Promise<Result<Submission, SubmissionError>> {
    const submission = this.submissions.get(id);
    if (submission === undefined) {
      this.logger.warn('Submission not found', { id });
      return Promise.resolve(err(new SubmissionNotFoundError(id)));
    }
    return Promise.resolve(ok(submission));
  }

  public create(input: NewSubmissionInput): Promise<Result<Submission, SubmissionError>> {
    this.counter += 1;
    const id = `sub-${String(this.counter)}`;
    const submission = new Submission({
      id,
      title: input.title,
      type: input.type,
      submittedBy: input.submittedBy,
      submittedAt: this.clock.now(),
      status: input.status,
      note: null,
    });
    this.submissions.set(id, submission);
    return Promise.resolve(ok(submission));
  }

  public save(submission: Submission): Promise<Result<Submission, SubmissionError>> {
    this.submissions.set(submission.id, submission);
    return Promise.resolve(ok(submission));
  }
}
