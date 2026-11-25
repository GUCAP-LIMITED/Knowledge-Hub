import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { Tutorial, TutorialError, TutorialGateway } from '../../domain';

export interface MarkVideoCompleteUseCaseDeps {
  readonly tutorialGateway: TutorialGateway;
  readonly logger: Logger;
}

/** Mark an individual tutorial video completed for the current learner. */
export class MarkVideoCompleteUseCase {
  private readonly tutorialGateway: TutorialGateway;
  private readonly logger: Logger;

  public constructor(deps: MarkVideoCompleteUseCaseDeps) {
    this.tutorialGateway = deps.tutorialGateway;
    this.logger = deps.logger.child('mark-video-complete');
  }

  public async execute(
    id: string,
    mediaAssetId: string,
  ): Promise<Result<Tutorial, TutorialError>> {
    const result = await this.tutorialGateway.markVideoComplete(id, mediaAssetId);
    if (!result.ok) {
      this.logger.warn('Marking tutorial video complete failed', {
        code: result.error.code,
        id,
        mediaAssetId,
      });
    }
    return result;
  }
}
