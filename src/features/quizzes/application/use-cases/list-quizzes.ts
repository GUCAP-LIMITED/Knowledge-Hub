import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { Quiz, QuizError, QuizGateway } from '../../domain';

export interface ListQuizzesUseCaseDeps {
  readonly quizGateway: QuizGateway;
  readonly logger: Logger;
}

/** List every quiz attached to a piece of content. */
export class ListQuizzesUseCase {
  private readonly quizGateway: QuizGateway;
  private readonly logger: Logger;

  public constructor(deps: ListQuizzesUseCaseDeps) {
    this.quizGateway = deps.quizGateway;
    this.logger = deps.logger.child('list-quizzes');
  }

  public async execute(contentId: string): Promise<Result<readonly Quiz[], QuizError>> {
    const result = await this.quizGateway.listByContent(contentId);
    if (!result.ok) {
      this.logger.warn('Listing quizzes failed', { code: result.error.code, contentId });
    }
    return result;
  }
}
