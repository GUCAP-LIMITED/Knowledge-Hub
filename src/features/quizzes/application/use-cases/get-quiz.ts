import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { Quiz, QuizError, QuizGateway } from '../../domain';

export interface GetQuizUseCaseDeps {
  readonly quizGateway: QuizGateway;
  readonly logger: Logger;
}

/** Fetch the quiz attached to a piece of content (or `null` when none exists). */
export class GetQuizUseCase {
  private readonly quizGateway: QuizGateway;
  private readonly logger: Logger;

  public constructor(deps: GetQuizUseCaseDeps) {
    this.quizGateway = deps.quizGateway;
    this.logger = deps.logger.child('get-quiz');
  }

  public async execute(contentId: string): Promise<Result<Quiz | null, QuizError>> {
    const result = await this.quizGateway.findByContent(contentId);
    if (!result.ok) {
      this.logger.warn('Getting quiz failed', { code: result.error.code, contentId });
    }
    return result;
  }
}
