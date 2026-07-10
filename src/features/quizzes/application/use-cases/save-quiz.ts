import { type Result, err } from '@core/result';
import type { Logger } from '@core/logger';
import {
  InvalidQuizError,
  Quiz,
  type QuizError,
  type QuizGateway,
  type QuizProps,
  quizPropsError,
} from '../../domain';

export type SaveQuizInput = QuizProps;

export interface SaveQuizUseCaseDeps {
  readonly quizGateway: QuizGateway;
  readonly logger: Logger;
}

/** Create or replace the quiz for a piece of content (admin authoring). */
export class SaveQuizUseCase {
  private readonly quizGateway: QuizGateway;
  private readonly logger: Logger;

  public constructor(deps: SaveQuizUseCaseDeps) {
    this.quizGateway = deps.quizGateway;
    this.logger = deps.logger.child('save-quiz');
  }

  public execute(input: SaveQuizInput): Promise<Result<Quiz, QuizError>> {
    const invalid = quizPropsError(input);
    if (invalid !== null) {
      this.logger.warn('Rejected invalid quiz', { reason: invalid });
      return Promise.resolve(err(new InvalidQuizError(invalid)));
    }
    return this.quizGateway.save(new Quiz(input));
  }
}
