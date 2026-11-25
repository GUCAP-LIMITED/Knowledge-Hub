import type { Logger } from '@core/logger';
import { type Result, err, ok } from '@core/result';
import {
  Quiz,
  type QuizAnswers,
  type QuizError,
  type QuizGateway,
  type QuizLearnerStatus,
  QuizNotFoundError,
  type QuizResult,
} from '../domain';
import { QUIZ_SEED } from './quiz-seed';

export interface InMemoryQuizGatewayDeps {
  readonly logger: Logger;
}

/**
 * In-memory implementation of {@link QuizGateway}, seeded from the prototype quizzes. Keyed by quiz
 * id; a content can carry several quizzes. Replace with an HTTP adapter to go live.
 */
export class InMemoryQuizGateway implements QuizGateway {
  private readonly logger: Logger;
  private readonly quizzes: Map<string, Quiz>;

  public constructor(deps: InMemoryQuizGatewayDeps) {
    this.logger = deps.logger.child('quiz-gateway');
    this.quizzes = new Map(QUIZ_SEED.map((props) => [props.id, new Quiz(props)]));
  }

  public listByContent(contentId: string): Promise<Result<readonly Quiz[], QuizError>> {
    const list = [...this.quizzes.values()].filter((q) => q.contentId === contentId);
    return Promise.resolve(ok(list));
  }

  public getById(quizId: string): Promise<Result<Quiz | null, QuizError>> {
    return Promise.resolve(ok(this.quizzes.get(quizId) ?? null));
  }

  public save(quiz: Quiz): Promise<Result<Quiz, QuizError>> {
    this.quizzes.set(quiz.id, quiz);
    this.logger.info('Quiz saved', { quizId: quiz.id, contentId: quiz.contentId });
    return Promise.resolve(ok(quiz));
  }

  public remove(quizId: string): Promise<Result<void, QuizError>> {
    if (!this.quizzes.has(quizId)) {
      return Promise.resolve(err(new QuizNotFoundError(quizId)));
    }
    this.quizzes.delete(quizId);
    return Promise.resolve(ok(undefined));
  }

  public submit(
    _quizId: string,
    answers: QuizAnswers,
    quiz: Quiz,
  ): Promise<Result<QuizResult, QuizError>> {
    return Promise.resolve(ok(quiz.grade(answers)));
  }

  public getMyStatus(quizId: string): Promise<Result<QuizLearnerStatus, QuizError>> {
    const quiz = this.quizzes.get(quizId);
    if (!quiz) {
      return Promise.resolve(err(new QuizNotFoundError(quizId)));
    }
    return Promise.resolve(
      ok({
        status: 'not_attempted' as const,
        hasEverPassed: false,
        attemptCount: 0,
        versionAttemptCount: 0,
        canAttempt: true,
        isQuizUpdatedSinceLastAttempt: false,
        latestResult: null,
        latestAnswers: null,
      }),
    );
  }
}
