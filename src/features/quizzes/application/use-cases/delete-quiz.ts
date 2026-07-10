import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { QuizError, QuizGateway } from '../../domain';

export interface DeleteQuizUseCaseDeps {
  readonly quizGateway: QuizGateway;
  readonly logger: Logger;
}

/** Remove a quiz by its id (admin authoring). */
export class DeleteQuizUseCase {
  private readonly quizGateway: QuizGateway;
  private readonly logger: Logger;

  public constructor(deps: DeleteQuizUseCaseDeps) {
    this.quizGateway = deps.quizGateway;
    this.logger = deps.logger.child('delete-quiz');
  }

  public async execute(quizId: string): Promise<Result<void, QuizError>> {
    const result = await this.quizGateway.remove(quizId);
    if (!result.ok) {
      this.logger.warn('Deleting quiz failed', { code: result.error.code, quizId });
    }
    return result;
  }
}
