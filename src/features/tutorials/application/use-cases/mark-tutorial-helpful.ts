import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { Tutorial, TutorialError, TutorialGateway } from '../../domain';

export interface MarkTutorialHelpfulUseCaseDeps {
  readonly tutorialGateway: TutorialGateway;
  readonly logger: Logger;
}

/** Toggle or register a helpful vote for a tutorial for the current learner. */
export class MarkTutorialHelpfulUseCase {
  private readonly tutorialGateway: TutorialGateway;
  private readonly logger: Logger;

  public constructor(deps: MarkTutorialHelpfulUseCaseDeps) {
    this.tutorialGateway = deps.tutorialGateway;
    this.logger = deps.logger.child('mark-tutorial-helpful');
  }

  public async execute(id: string): Promise<Result<Tutorial, TutorialError>> {
    const result = await this.tutorialGateway.markHelpful(id);
    if (!result.ok) {
      this.logger.warn('Marking tutorial helpful failed', {
        code: result.error.code,
        id,
      });
    }
    return result;
  }
}
