import { type Result, ok } from '@core/result';
import type {
  CreatePermissionSetInput,
  PermissionMap,
  PermissionSetDetail,
  PermissionSetError,
  PermissionSetSummary,
  PermissionUpdateResult,
  PermissionsGateway,
  SidebarGroup,
  UpdatePermissionSetInput,
  UserEffectivePermissions,
  UserTypeDefault,
} from '@features/permissions/domain';
import { buildPermissionSetDetail } from '../builders/permission-set.builder';

const emptyUpdate: PermissionUpdateResult = { added: [], removed: [], changedCount: 0 };

/** Hand-written, fully-typed fake of the {@link PermissionsGateway} port. */
export class FakePermissionSetGateway implements PermissionsGateway {
  public myPermissionsResult: Result<PermissionMap, PermissionSetError> = ok({});
  public myPermissionModulesResult: Result<readonly SidebarGroup[], PermissionSetError> =
    ok([]);
  public listResult: Result<readonly PermissionSetSummary[], PermissionSetError> = ok([]);
  public detailResult: Result<PermissionSetDetail, PermissionSetError> = ok(
    buildPermissionSetDetail(),
  );
  public voidResult: Result<void, PermissionSetError> = ok(undefined);
  public typeDefaultsResult: Result<readonly UserTypeDefault[], PermissionSetError> = ok(
    [],
  );
  public updateResult: Result<PermissionUpdateResult, PermissionSetError> =
    ok(emptyUpdate);
  public userPermissionsResult: Result<UserEffectivePermissions, PermissionSetError> = ok(
    {
      userId: 'u1',
      userName: 'User',
      userTypeName: 'BranchManager',
      permissionModules: [],
      directGrantedPermissions: [],
      deniedPermissions: [],
    },
  );

  public lastCreate: CreatePermissionSetInput | null = null;
  public lastUpdate: { id: string; input: UpdatePermissionSetInput } | null = null;
  public lastSetDefault: { userTypeId: string; roleId: string; apply: boolean } | null =
    null;

  public myPermissions(): Promise<Result<PermissionMap, PermissionSetError>> {
    return Promise.resolve(this.myPermissionsResult);
  }

  public myPermissionModules(): Promise<
    Result<readonly SidebarGroup[], PermissionSetError>
  > {
    return Promise.resolve(this.myPermissionModulesResult);
  }

  public listSets(): Promise<
    Result<readonly PermissionSetSummary[], PermissionSetError>
  > {
    return Promise.resolve(this.listResult);
  }

  public getSet(): Promise<Result<PermissionSetDetail, PermissionSetError>> {
    return Promise.resolve(this.detailResult);
  }

  public createSet(
    input: CreatePermissionSetInput,
  ): Promise<Result<PermissionSetDetail, PermissionSetError>> {
    this.lastCreate = input;
    return Promise.resolve(this.detailResult);
  }

  public updateSet(
    id: string,
    input: UpdatePermissionSetInput,
  ): Promise<Result<PermissionSetDetail, PermissionSetError>> {
    this.lastUpdate = { id, input };
    return Promise.resolve(this.detailResult);
  }

  public deleteSet(): Promise<Result<void, PermissionSetError>> {
    return Promise.resolve(this.voidResult);
  }

  public typeDefaults(): Promise<Result<readonly UserTypeDefault[], PermissionSetError>> {
    return Promise.resolve(this.typeDefaultsResult);
  }

  public setTypeDefault(
    userTypeId: string,
    permissionSetRoleId: string,
    applyToExistingUsers: boolean,
  ): Promise<Result<void, PermissionSetError>> {
    this.lastSetDefault = {
      userTypeId,
      roleId: permissionSetRoleId,
      apply: applyToExistingUsers,
    };
    return Promise.resolve(this.voidResult);
  }

  public userPermissions(): Promise<
    Result<UserEffectivePermissions, PermissionSetError>
  > {
    return Promise.resolve(this.userPermissionsResult);
  }

  public setUserPermissionSet(): Promise<Result<void, PermissionSetError>> {
    return Promise.resolve(this.voidResult);
  }

  public updateUserGrants(): Promise<Result<PermissionUpdateResult, PermissionSetError>> {
    return Promise.resolve(this.updateResult);
  }

  public replaceUserDenies(): Promise<
    Result<PermissionUpdateResult, PermissionSetError>
  > {
    return Promise.resolve(this.updateResult);
  }
}
