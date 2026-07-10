import { type Result, err, ok } from '@core/result';
import type { Logger } from '@core/logger';
import {
  type QuizAnswers,
  type QuizError,
  type QuizGateway,
  QuizNotFoundError,
  type QuizResult,
} from '../../domain';

export interface SubmitQuizUseCaseDeps {
  readonly quizGateway: QuizGateway;
  readonly logger: Logger;
}

/** Grade a learner's answers for one quiz and return the pass/fail result. */
export class SubmitQuizUseCase {
  private readonly quizGateway: QuizGateway;
  private readonly logger: Logger;

  public constructor(deps: SubmitQuizUseCaseDeps) {
    this.quizGateway = deps.quizGateway;
    this.logger = deps.logger.child('submit-quiz');
  }

  public async execute(
    quizId: string,
    answers: QuizAnswers,
  ): Promise<Result<QuizResult, QuizError>> {
    const found = await this.quizGateway.getById(quizId);
    if (!found.ok) {
      return found;
    }
    if (found.value === null) {
      this.logger.warn('No quiz to grade', { quizId });
      return err(new QuizNotFoundError(quizId));
    }
    return ok(found.value.grade(answers));
  }
}
