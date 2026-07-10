import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { TutorialError, TutorialGateway } from '../../domain';

export interface DeleteTutorialUseCaseDeps {
  readonly tutorialGateway: TutorialGateway;
  readonly logger: Logger;
}

/** Remove a tutorial from the library (admin). */
export class DeleteTutorialUseCase {
  private readonly tutorialGateway: TutorialGateway;
  private readonly logger: Logger;

  public constructor(deps: DeleteTutorialUseCaseDeps) {
    this.tutorialGateway = deps.tutorialGateway;
    this.logger = deps.logger.child('delete-tutorial');
  }

  public execute(id: string): Promise<Result<void, TutorialError>> {
    this.logger.info('Deleting tutorial', { id });
    return this.tutorialGateway.remove(id);
  }
}
