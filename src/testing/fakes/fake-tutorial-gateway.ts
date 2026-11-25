import { type Result, ok } from '@core/result';
import type {
  Tutorial,
  TutorialError,
  TutorialGateway,
  TutorialCatalogParams,
  PagedResult,
  EnumValue,
} from '@features/tutorials/domain';
import { buildTutorial } from '../builders/tutorial.builder';

/** Hand-written, fully-typed fake of the {@link TutorialGateway} port. */
export class FakeTutorialGateway implements TutorialGateway {
  public listResult: Result<PagedResult<Tutorial>, TutorialError> = ok({
    items: [],
    totalCount: 0,
  });
  public getByIdResult: Result<Tutorial, TutorialError> = ok(buildTutorial());
  public markCompleteResult: Result<Tutorial, TutorialError> = ok(
    buildTutorial({ completed: true }),
  );
  public markVideoCompleteResult: Result<Tutorial, TutorialError> = ok(
    buildTutorial({ completed: true }),
  );
  public markHelpfulResult: Result<Tutorial, TutorialError> = ok(
    buildTutorial({ helpfulCount: 1, isHelpful: true }),
  );

  public lastRequestedId: string | null = null;
  public lastRequestedMediaAssetId: string | null = null;

  public list(
    _params?: TutorialCatalogParams,
  ): Promise<Result<PagedResult<Tutorial>, TutorialError>> {
    return Promise.resolve(this.listResult);
  }

  public getById(id: string): Promise<Result<Tutorial, TutorialError>> {
    this.lastRequestedId = id;
    return Promise.resolve(this.getByIdResult);
  }

  public save(tutorial: Tutorial): Promise<Result<Tutorial, TutorialError>> {
    return Promise.resolve(ok(tutorial));
  }

  public markComplete(id: string): Promise<Result<Tutorial, TutorialError>> {
    this.lastRequestedId = id;
    return Promise.resolve(this.markCompleteResult);
  }

  public markVideoComplete(
    id: string,
    mediaAssetId: string,
  ): Promise<Result<Tutorial, TutorialError>> {
    this.lastRequestedId = id;
    this.lastRequestedMediaAssetId = mediaAssetId;
    return Promise.resolve(this.markVideoCompleteResult);
  }

  public markHelpful(id: string): Promise<Result<Tutorial, TutorialError>> {
    this.lastRequestedId = id;
    return Promise.resolve(this.markHelpfulResult);
  }

  public remove(_id: string): Promise<Result<void, TutorialError>> {
    return Promise.resolve(ok(undefined));
  }

  public getEnum(
    _enumName: string,
  ): Promise<Result<readonly EnumValue[], TutorialError>> {
    return Promise.resolve(ok([]));
  }
}
