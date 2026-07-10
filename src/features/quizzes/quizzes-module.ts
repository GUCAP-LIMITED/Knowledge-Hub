import type { Logger } from '@core/logger';
import {
  DeleteQuizUseCase,
  ListQuizzesUseCase,
  SaveQuizUseCase,
  SubmitQuizUseCase,
} from './application';
import { InMemoryQuizGateway } from './infrastructure';

export interface QuizzesModuleDeps {
  readonly logger: Logger;
}

/** The use cases exposed by the quizzes feature, consumed via a context provider. */
export interface QuizzesModule {
  readonly listQuizzes: ListQuizzesUseCase;
  readonly submitQuiz: SubmitQuizUseCase;
  readonly saveQuiz: SaveQuizUseCase;
  readonly deleteQuiz: DeleteQuizUseCase;
}

/**
 * Composition root *for the quizzes feature*. Wires the in-memory gateway to the use cases. Bind an
 * HTTP gateway here to go live.
 */
export const createQuizzesModule = (deps: QuizzesModuleDeps): QuizzesModule => {
  const quizGateway = new InMemoryQuizGateway({ logger: deps.logger });
  return {
    listQuizzes: new ListQuizzesUseCase({ quizGateway, logger: deps.logger }),
    submitQuiz: new SubmitQuizUseCase({ quizGateway, logger: deps.logger }),
    saveQuiz: new SaveQuizUseCase({ quizGateway, logger: deps.logger }),
    deleteQuiz: new DeleteQuizUseCase({ quizGateway, logger: deps.logger }),
  };
};
