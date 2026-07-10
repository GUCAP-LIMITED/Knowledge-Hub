import { DomainError } from '@core/errors';

/** Base type for every quizzes-domain failure. Lets callers `catch`/`switch` on intent. */
export abstract class QuizError extends DomainError {}

/** The quizzes source could not be reached or returned an unexpected response. */
export class QuizzesUnavailableError extends QuizError {
  public readonly code = 'QUIZZES_UNAVAILABLE';

  public constructor(cause?: unknown) {
    super('Quizzes are currently unavailable. Please try again.', { cause });
  }
}

/** No quiz exists for the given content. */
export class QuizNotFoundError extends QuizError {
  public readonly code = 'QUIZZES_NOT_FOUND';

  public constructor(contentId: string) {
    super(`No quiz found for content "${contentId}".`, { context: { contentId } });
  }
}

/** A quiz was submitted or saved with structurally invalid data. */
export class InvalidQuizError extends QuizError {
  public readonly code = 'QUIZZES_INVALID';

  public constructor(reason: string) {
    super(`Invalid quiz: ${reason}`, { context: { reason } });
  }
}
