import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import {
  DeleteTutorialUseCase,
  GetTutorialUseCase,
  ListTutorialsUseCase,
  MarkTutorialCompleteUseCase,
  MarkVideoCompleteUseCase,
  MarkTutorialHelpfulUseCase,
  UpdateTutorialUseCase,
} from './application';
import { HttpTutorialGateway } from './infrastructure';

import type { Result } from '@core/result';
import type { EnumValue, TutorialError } from './domain';

export interface TutorialsModuleDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

/** The use cases exposed by the tutorials feature, consumed via a context provider. */
export interface TutorialsModule {
  readonly listTutorials: ListTutorialsUseCase;
  readonly getTutorial: GetTutorialUseCase;
  readonly updateTutorial: UpdateTutorialUseCase;
  readonly deleteTutorial: DeleteTutorialUseCase;
  readonly markTutorialComplete: MarkTutorialCompleteUseCase;
  readonly markVideoComplete: MarkVideoCompleteUseCase;
  readonly markTutorialHelpful: MarkTutorialHelpfulUseCase;
  readonly getEnum: (
    enumName: string,
  ) => Promise<Result<readonly EnumValue[], TutorialError>>;
}

/**
 * Composition root *for the tutorials feature*. Wires the HTTP gateway to the use cases.
 */
export const createTutorialsModule = (deps: TutorialsModuleDeps): TutorialsModule => {
  const tutorialGateway = new HttpTutorialGateway({
    httpClient: deps.httpClient,
    logger: deps.logger,
  });

  return {
    listTutorials: new ListTutorialsUseCase({ tutorialGateway, logger: deps.logger }),
    getTutorial: new GetTutorialUseCase({ tutorialGateway, logger: deps.logger }),
    updateTutorial: new UpdateTutorialUseCase({ tutorialGateway, logger: deps.logger }),
    deleteTutorial: new DeleteTutorialUseCase({ tutorialGateway, logger: deps.logger }),
    markTutorialComplete: new MarkTutorialCompleteUseCase({
      tutorialGateway,
      logger: deps.logger,
    }),
    markVideoComplete: new MarkVideoCompleteUseCase({
      tutorialGateway,
      logger: deps.logger,
    }),
    markTutorialHelpful: new MarkTutorialHelpfulUseCase({
      tutorialGateway,
      logger: deps.logger,
    }),
    getEnum: (enumName) => tutorialGateway.getEnum(enumName),
  };
};
