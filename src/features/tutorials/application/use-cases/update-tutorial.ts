import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import type { Tutorial, TutorialError, TutorialGateway } from '../../domain';

export interface UpdateTutorialInput {
  readonly id: string;
  readonly title: string;
  readonly category: string;
}

export interface UpdateTutorialUseCaseDeps {
  readonly tutorialGateway: TutorialGateway;
  readonly logger: Logger;
}

/** Edit a tutorial's title + category (admin, in-place in the library). */
export class UpdateTutorialUseCase {
  private readonly tutorialGateway: TutorialGateway;
  private readonly logger: Logger;

  public constructor(deps: UpdateTutorialUseCaseDeps) {
    this.tutorialGateway = deps.tutorialGateway;
    this.logger = deps.logger.child('update-tutorial');
  }

  public async execute(
    input: UpdateTutorialInput,
  ): Promise<Result<Tutorial, TutorialError>> {
    const existing = await this.tutorialGateway.getById(input.id);
    if (isErr(existing)) {
      this.logger.warn('Tutorial not found for update', { id: input.id });
      return existing;
    }
    return this.tutorialGateway.save(
      existing.value.withDetails(input.title, input.category),
    );
  }
}
