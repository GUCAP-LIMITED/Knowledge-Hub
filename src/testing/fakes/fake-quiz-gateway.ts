import { type Result, ok } from '@core/result';
import type { Quiz, QuizError, QuizGateway } from '@features/quizzes/domain';

/** Hand-written, fully-typed fake of the {@link QuizGateway} port. */
export class FakeQuizGateway implements QuizGateway {
  public listResult: Result<readonly Quiz[], QuizError> = ok([]);
  public getByIdResult: Result<Quiz | null, QuizError> = ok(null);
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
}
