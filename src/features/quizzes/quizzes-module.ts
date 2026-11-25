import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import {
  DeleteQuizUseCase,
  GetMyQuizStatusUseCase,
  ListQuizzesUseCase,
  SaveQuizUseCase,
  SubmitQuizUseCase,
} from './application';
import { HttpQuizGateway } from './infrastructure';

export interface QuizzesModuleDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

/** The use cases exposed by the quizzes feature, consumed via a context provider. */
export interface QuizzesModule {
  readonly listQuizzes: ListQuizzesUseCase;
  readonly submitQuiz: SubmitQuizUseCase;
  readonly saveQuiz: SaveQuizUseCase;
  readonly deleteQuiz: DeleteQuizUseCase;
  readonly getMyQuizStatus: GetMyQuizStatusUseCase;
}

/**
 * Composition root *for the quizzes feature*. Wires the gateway to the use cases.
 */
export const createQuizzesModule = (deps: QuizzesModuleDeps): QuizzesModule => {
  const quizGateway = new HttpQuizGateway({
    httpClient: deps.httpClient,
    logger: deps.logger,
  });
  return {
    listQuizzes: new ListQuizzesUseCase({ quizGateway, logger: deps.logger }),
    submitQuiz: new SubmitQuizUseCase({ quizGateway, logger: deps.logger }),
    saveQuiz: new SaveQuizUseCase({ quizGateway, logger: deps.logger }),
    deleteQuiz: new DeleteQuizUseCase({ quizGateway, logger: deps.logger }),
    getMyQuizStatus: new GetMyQuizStatusUseCase({ quizGateway, logger: deps.logger }),
  };
};
