import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { Tutorial, TutorialError, TutorialGateway } from '../../domain';

export interface GetTutorialUseCaseDeps {
  readonly tutorialGateway: TutorialGateway;
  readonly logger: Logger;
}

/** Fetch a single tutorial by id. */
export class GetTutorialUseCase {
  private readonly tutorialGateway: TutorialGateway;
  private readonly logger: Logger;

  public constructor(deps: GetTutorialUseCaseDeps) {
    this.tutorialGateway = deps.tutorialGateway;
    this.logger = deps.logger.child('get-tutorial');
  }

  public async execute(id: string): Promise<Result<Tutorial, TutorialError>> {
    const result = await this.tutorialGateway.getById(id);
    if (!result.ok) {
      this.logger.warn('Getting tutorial failed', { code: result.error.code, id });
    }
    return result;
  }
}
