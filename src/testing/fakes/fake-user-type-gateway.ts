import { type Result, ok } from '@core/result';
import type {
  CreateUserTypeInput,
  SelectableUserType,
  UpdateUserTypeInput,
  UserType,
  UserTypeError,
  UserTypeGateway,
} from '@features/user-types/domain';
import { buildUserType } from '../builders/user-type.builder';

/** Hand-written, fully-typed fake of the {@link UserTypeGateway} port. */
export class FakeUserTypeGateway implements UserTypeGateway {
  public listResult: Result<readonly UserType[], UserTypeError> = ok([]);
  public writeResult: Result<UserType, UserTypeError> = ok(buildUserType());
  public removeResult: Result<void, UserTypeError> = ok(undefined);
  public selectableResult: Result<readonly SelectableUserType[], UserTypeError> = ok([]);

  public lastCreateInput: CreateUserTypeInput | null = null;
  public lastUpdate: { id: string; input: UpdateUserTypeInput } | null = null;
  public lastReorder: { id: string; hierarchyLevel: number } | null = null;
  public lastRemovedId: string | null = null;
  public lastAssignableOnly: boolean | null = null;

  public list(): Promise<Result<readonly UserType[], UserTypeError>> {
    return Promise.resolve(this.listResult);
  }

  public create(input: CreateUserTypeInput): Promise<Result<UserType, UserTypeError>> {
    this.lastCreateInput = input;
    return Promise.resolve(this.writeResult);
  }

  public update(
    id: string,
    input: UpdateUserTypeInput,
  ): Promise<Result<UserType, UserTypeError>> {
    this.lastUpdate = { id, input };
    return Promise.resolve(this.writeResult);
  }

  public reorder(
    id: string,
    hierarchyLevel: number,
  ): Promise<Result<UserType, UserTypeError>> {
    this.lastReorder = { id, hierarchyLevel };
    return Promise.resolve(this.writeResult);
  }

  public remove(id: string): Promise<Result<void, UserTypeError>> {
    this.lastRemovedId = id;
    return Promise.resolve(this.removeResult);
  }

  public selectable(
    assignableOnly: boolean,
  ): Promise<Result<readonly SelectableUserType[], UserTypeError>> {
    this.lastAssignableOnly = assignableOnly;
    return Promise.resolve(this.selectableResult);
  }
}
