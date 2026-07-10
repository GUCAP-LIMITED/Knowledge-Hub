import type { Logger } from '@core/logger';
import {
  DeleteTutorialUseCase,
  GetTutorialUseCase,
  ListTutorialsUseCase,
  UpdateTutorialUseCase,
} from './application';
import { InMemoryTutorialGateway } from './infrastructure';

export interface TutorialsModuleDeps {
  readonly logger: Logger;
}

/** The use cases exposed by the tutorials feature, consumed via a context provider. */
export interface TutorialsModule {
  readonly listTutorials: ListTutorialsUseCase;
  readonly getTutorial: GetTutorialUseCase;
  readonly updateTutorial: UpdateTutorialUseCase;
  readonly deleteTutorial: DeleteTutorialUseCase;
}

/**
 * Composition root *for the tutorials feature*. Wires the in-memory gateway to the use cases. The
 * only place inside the feature where layers are joined. Bind an HTTP gateway here to go live.
 */
export const createTutorialsModule = (deps: TutorialsModuleDeps): TutorialsModule => {
  const tutorialGateway = new InMemoryTutorialGateway({ logger: deps.logger });

  return {
    listTutorials: new ListTutorialsUseCase({ tutorialGateway, logger: deps.logger }),
    getTutorial: new GetTutorialUseCase({ tutorialGateway, logger: deps.logger }),
    updateTutorial: new UpdateTutorialUseCase({ tutorialGateway, logger: deps.logger }),
    deleteTutorial: new DeleteTutorialUseCase({ tutorialGateway, logger: deps.logger }),
  };
};
