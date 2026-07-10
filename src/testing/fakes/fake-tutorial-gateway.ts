import { type Result, ok } from '@core/result';
import type {
  Tutorial,
  TutorialError,
  TutorialGateway,
} from '@features/tutorials/domain';
import { buildTutorial } from '../builders/tutorial.builder';

/** Hand-written, fully-typed fake of the {@link TutorialGateway} port. */
export class FakeTutorialGateway implements TutorialGateway {
  public listResult: Result<readonly Tutorial[], TutorialError> = ok([]);
  public getByIdResult: Result<Tutorial, TutorialError> = ok(buildTutorial());

  public lastRequestedId: string | null = null;

  public list(): Promise<Result<readonly Tutorial[], TutorialError>> {
    return Promise.resolve(this.listResult);
  }

  public getById(id: string): Promise<Result<Tutorial, TutorialError>> {
    this.lastRequestedId = id;
    return Promise.resolve(this.getByIdResult);
  }

  public save(tutorial: Tutorial): Promise<Result<Tutorial, TutorialError>> {
    return Promise.resolve(ok(tutorial));
  }

  public remove(_id: string): Promise<Result<void, TutorialError>> {
    return Promise.resolve(ok(undefined));
  }
}
