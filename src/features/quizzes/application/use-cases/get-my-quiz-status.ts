import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { QuizError, QuizGateway, QuizLearnerStatus } from '../../domain';

export interface GetMyQuizStatusUseCaseDeps {
  readonly quizGateway: QuizGateway;
  readonly logger: Logger;
}

export class GetMyQuizStatusUseCase {
  private readonly quizGateway: QuizGateway;
  private readonly logger: Logger;

  public constructor(deps: GetMyQuizStatusUseCaseDeps) {
    this.quizGateway = deps.quizGateway;
    this.logger = deps.logger.child('get-my-quiz-status');
  }

  public async execute(quizId: string): Promise<Result<QuizLearnerStatus, QuizError>> {
    this.logger.debug('Fetching quiz learner status', { quizId });
    return this.quizGateway.getMyStatus(quizId);
  }
}
