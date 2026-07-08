import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { Tutorial, TutorialError, TutorialGateway } from '../../domain';

export interface ListTutorialsUseCaseDeps {
  readonly tutorialGateway: TutorialGateway;
  readonly logger: Logger;
}

/** Fetch the whole library. Pure orchestration: delegate to the gateway and return its `Result`. */
export class ListTutorialsUseCase {
  private readonly tutorialGateway: TutorialGateway;
  private readonly logger: Logger;

  public constructor(deps: ListTutorialsUseCaseDeps) {
    this.tutorialGateway = deps.tutorialGateway;
    this.logger = deps.logger.child('list-tutorials');
  }

  public async execute(): Promise<Result<readonly Tutorial[], TutorialError>> {
    const result = await this.tutorialGateway.list();
    if (!result.ok) {
      this.logger.warn('Listing tutorials failed', { code: result.error.code });
    }
    return result;
  }
}
