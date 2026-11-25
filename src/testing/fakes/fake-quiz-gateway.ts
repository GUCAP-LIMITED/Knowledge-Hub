import { type Result, ok } from '@core/result';
import type {
  Quiz,
  QuizAnswers,
  QuizError,
  QuizGateway,
  QuizLearnerStatus,
  QuizResult,
} from '@features/quizzes/domain';

/** Hand-written, fully-typed fake of the {@link QuizGateway} port. */
export class FakeQuizGateway implements QuizGateway {
  public listResult: Result<readonly Quiz[], QuizError> = ok([]);
  public getByIdResult: Result<Quiz | null, QuizError> = ok(null);
  public submitResult: Result<QuizResult, QuizError> | null = null;
  public myStatusResult: Result<QuizLearnerStatus, QuizError> = ok({
    status: 'not_attempted',
    hasEverPassed: false,
    attemptCount: 0,
    versionAttemptCount: 0,
    canAttempt: true,
    isQuizUpdatedSinceLastAttempt: false,
    latestResult: null,
    latestAnswers: null,
  });
  public lastRequestedContentId: string | null = null;
  public lastRequestedQuizId: string | null = null;
  public saved: Quiz[] = [];
  public removed: string[] = [];

  public listByContent(contentId: string): Promise<Result<readonly Quiz[], QuizError>> {
    this.lastRequestedContentId = contentId;
    return Promise.resolve(this.listResult);
  }

  public getById(quizId: string): Promise<Result<Quiz | null, QuizError>> {
    this.lastRequestedQuizId = quizId;
    return Promise.resolve(this.getByIdResult);
  }

  public save(quiz: Quiz): Promise<Result<Quiz, QuizError>> {
    this.saved.push(quiz);
    return Promise.resolve(ok(quiz));
  }

  public remove(quizId: string): Promise<Result<void, QuizError>> {
    this.removed.push(quizId);
    return Promise.resolve(ok(undefined));
  }

  public submit(
    _quizId: string,
    answers: QuizAnswers,
    quiz: Quiz,
  ): Promise<Result<QuizResult, QuizError>> {
    if (this.submitResult !== null) {
      return Promise.resolve(this.submitResult);
    }
    return Promise.resolve(ok(quiz.grade(answers)));
  }

  public getMyStatus(quizId: string): Promise<Result<QuizLearnerStatus, QuizError>> {
    this.lastRequestedQuizId = quizId;
    return Promise.resolve(this.myStatusResult);
  }
}
