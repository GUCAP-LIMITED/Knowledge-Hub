import type { Logger } from '@core/logger';
import { type Result, ok, err } from '@core/result';
import {
  Tutorial,
  type TutorialError,
  type TutorialGateway,
  TutorialNotFoundError,
} from '../domain';
import { TUTORIAL_SEED } from './tutorial-seed';

export interface InMemoryTutorialGatewayDeps {
  readonly logger: Logger;
}

/**
 * In-memory implementation of {@link TutorialGateway}, seeded from the prototype library. A
 * legitimate infrastructure adapter (storage, not network) — it keeps the app a working prototype
 * with no backend while honouring the port contract. Replace with an HTTP adapter to go live.
 */
export class InMemoryTutorialGateway implements TutorialGateway {
  private readonly logger: Logger;
  private readonly tutorials: Map<string, Tutorial>;

  public constructor(deps: InMemoryTutorialGatewayDeps) {
    this.logger = deps.logger.child('tutorial-gateway');
    this.tutorials = new Map(
      TUTORIAL_SEED.map((props) => [props.id, new Tutorial(props)]),
    );
  }

  public list(): Promise<Result<readonly Tutorial[], TutorialError>> {
    return Promise.resolve(ok([...this.tutorials.values()]));
  }

  public getById(id: string): Promise<Result<Tutorial, TutorialError>> {
    const tutorial = this.tutorials.get(id);
    if (tutorial === undefined) {
      this.logger.warn('Tutorial not found', { id });
      return Promise.resolve(err(new TutorialNotFoundError(id)));
    }
    return Promise.resolve(ok(tutorial));
  }

  public save(tutorial: Tutorial): Promise<Result<Tutorial, TutorialError>> {
    this.tutorials.set(tutorial.id, tutorial);
    return Promise.resolve(ok(tutorial));
  }

  public remove(id: string): Promise<Result<void, TutorialError>> {
    if (!this.tutorials.has(id)) {
      this.logger.warn('Tutorial not found for removal', { id });
      return Promise.resolve(err(new TutorialNotFoundError(id)));
    }
    this.tutorials.delete(id);
    return Promise.resolve(ok(undefined));
  }
}
