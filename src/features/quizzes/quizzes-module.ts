import type { Logger } from '@core/logger';
import { GetQuizUseCase, SaveQuizUseCase, SubmitQuizUseCase } from './application';
import { InMemoryQuizGateway } from './infrastructure';

export interface QuizzesModuleDeps {
  readonly logger: Logger;
}

/** The use cases exposed by the quizzes feature, consumed via a context provider. */
export interface QuizzesModule {
  readonly getQuiz: GetQuizUseCase;
  readonly submitQuiz: SubmitQuizUseCase;
  readonly saveQuiz: SaveQuizUseCase;
}

/**
 * Composition root *for the quizzes feature*. Wires the in-memory gateway to the use cases. Bind an
 * HTTP gateway here to go live.
 */
export const createQuizzesModule = (deps: QuizzesModuleDeps): QuizzesModule => {
  const quizGateway = new InMemoryQuizGateway({ logger: deps.logger });
  return {
    getQuiz: new GetQuizUseCase({ quizGateway, logger: deps.logger }),
    submitQuiz: new SubmitQuizUseCase({ quizGateway, logger: deps.logger }),
    saveQuiz: new SaveQuizUseCase({ quizGateway, logger: deps.logger }),
  };
};
