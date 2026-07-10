import { type Result, ok } from '@core/result';
import type { Quiz, QuizError, QuizGateway } from '@features/quizzes/domain';

/** Hand-written, fully-typed fake of the {@link QuizGateway} port. */
export class FakeQuizGateway implements QuizGateway {
  public findResult: Result<Quiz | null, QuizError> = ok(null);
  public lastRequestedContentId: string | null = null;
  public saved: Quiz[] = [];

  public findByContent(contentId: string): Promise<Result<Quiz | null, QuizError>> {
    this.lastRequestedContentId = contentId;
    return Promise.resolve(this.findResult);
  }

  public save(quiz: Quiz): Promise<Result<Quiz, QuizError>> {
    this.saved.push(quiz);
    return Promise.resolve(ok(quiz));
  }
}
