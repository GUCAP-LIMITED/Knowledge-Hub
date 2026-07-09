import { type Result, ok } from '@core/result';
import type { UserAccount, UserError, UserGateway } from '@features/users/domain';

/** Hand-written, fully-typed fake of the {@link UserGateway} port. */
export class FakeUserGateway implements UserGateway {
  public listResult: Result<readonly UserAccount[], UserError> = ok([]);

  public list(): Promise<Result<readonly UserAccount[], UserError>> {
    return Promise.resolve(this.listResult);
  }
}
