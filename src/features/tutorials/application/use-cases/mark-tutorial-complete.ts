import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { Tutorial, TutorialError, TutorialGateway } from '../../domain';

export interface MarkTutorialCompleteUseCaseDeps {
  readonly tutorialGateway: TutorialGateway;
  readonly logger: Logger;
}

/** Mark a tutorial as completed for the current learner (idempotent on the backend). */
export class MarkTutorialCompleteUseCase {
  private readonly tutorialGateway: TutorialGateway;
  private readonly logger: Logger;

  public constructor(deps: MarkTutorialCompleteUseCaseDeps) {
    this.tutorialGateway = deps.tutorialGateway;
    this.logger = deps.logger.child('mark-tutorial-complete');
  }

  public async execute(id: string): Promise<Result<Tutorial, TutorialError>> {
    const result = await this.tutorialGateway.markComplete(id);
    if (!result.ok) {
      this.logger.warn('Marking tutorial complete failed', {
        code: result.error.code,
        id,
      });
    }
    return result;
  }
}
