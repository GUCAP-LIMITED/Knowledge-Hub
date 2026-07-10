import { type Result, err } from '@core/result';
import type { Logger } from '@core/logger';
import {
  InvalidQuizError,
  Quiz,
  type QuizError,
  type QuizGateway,
  type QuizProps,
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
    const invalid = validate(input);
    if (invalid !== null) {
      this.logger.warn('Rejected invalid quiz', { reason: invalid });
      return Promise.resolve(err(new InvalidQuizError(invalid)));
    }
    return this.quizGateway.save(new Quiz(input));
  }
}

const validate = (input: SaveQuizInput): string | null => {
  if (input.questions.length === 0) {
    return 'a quiz needs at least one question';
  }
  for (const question of input.questions) {
    if (question.prompt.trim() === '') {
      return 'every question needs a prompt';
    }
    if (question.options.length < 2) {
      return 'every question needs at least two answers';
    }
    if (question.correctIndexes.length === 0) {
      return 'every question needs at least one correct answer';
    }
    const outOfRange = question.correctIndexes.some(
      (index) => index < 0 || index >= question.options.length,
    );
    if (outOfRange) {
      return 'every correct answer must reference a real option';
    }
  }
  return null;
};
