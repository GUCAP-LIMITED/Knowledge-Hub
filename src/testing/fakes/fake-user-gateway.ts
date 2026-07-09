import { type Result, ok, err } from '@core/result';
import {
  type UserAccount,
  type UserError,
  type UserGateway,
  UserNotFoundError,
} from '@features/users/domain';

/** Hand-written, fully-typed fake of the {@link UserGateway} port. */
export class FakeUserGateway implements UserGateway {
  public listResult: Result<readonly UserAccount[], UserError> = ok([]);
  public readonly saved: UserAccount[] = [];

  public list(): Promise<Result<readonly UserAccount[], UserError>> {
    return Promise.resolve(this.listResult);
  }

  public getById(id: string): Promise<Result<UserAccount, UserError>> {
    if (this.listResult.ok) {
      const found = this.listResult.value.find((user) => user.id === id);
      if (found !== undefined) {
        return Promise.resolve(ok(found));
      }
    }
    return Promise.resolve(err(new UserNotFoundError(id)));
  }

  public save(user: UserAccount): Promise<Result<UserAccount, UserError>> {
    this.saved.push(user);
    return Promise.resolve(ok(user));
  }
}
