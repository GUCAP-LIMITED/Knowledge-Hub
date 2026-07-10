import type { Logger } from '@core/logger';
import { type Result, ok } from '@core/result';
import { Quiz, type QuizError, type QuizGateway } from '../domain';
import { QUIZ_SEED } from './quiz-seed';

export interface InMemoryQuizGatewayDeps {
  readonly logger: Logger;
}

/**
 * In-memory implementation of {@link QuizGateway}, seeded from the prototype quizzes. Keyed by the
 * content id it is attached to. Replace with an HTTP adapter to go live.
 */
export class InMemoryQuizGateway implements QuizGateway {
  private readonly logger: Logger;
  private readonly byContent: Map<string, Quiz>;

  public constructor(deps: InMemoryQuizGatewayDeps) {
    this.logger = deps.logger.child('quiz-gateway');
    this.byContent = new Map(
      QUIZ_SEED.map((props) => [props.contentId, new Quiz(props)]),
    );
  }

  public findByContent(contentId: string): Promise<Result<Quiz | null, QuizError>> {
    return Promise.resolve(ok(this.byContent.get(contentId) ?? null));
  }

  public save(quiz: Quiz): Promise<Result<Quiz, QuizError>> {
    this.byContent.set(quiz.contentId, quiz);
    this.logger.info('Quiz saved', { contentId: quiz.contentId });
    return Promise.resolve(ok(quiz));
  }
}
