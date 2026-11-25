import type { Result } from '@core/result';
import type { PermissionSetError } from '../errors/permission-set-errors';
import type {
  PermissionMap,
  PermissionSetDetail,
  PermissionSetSummary,
  PermissionUpdateResult,
  SidebarGroup,
  UserEffectivePermissions,
  UserTypeDefault,
} from '../entities/permission-set';

/** Fields for creating a permission set. */
export interface CreatePermissionSetInput {
  readonly name: string;
  readonly description: string | null;
  readonly color: string | null;
  readonly bgColor: string | null;
  readonly permissions: PermissionMap;
}

/** Fields for updating a permission set (send the FULL map — the backend diffs). */
export interface UpdatePermissionSetInput {
  readonly name: string;
  readonly description: string | null;
  readonly color: string | null;
  readonly bgColor: string | null;
  readonly permissions: PermissionMap;
}

/**
 * Port to the permissions service. The domain states the contract in its own terms; HTTP details
 * live in the infrastructure implementation.
 */
export interface PermissionsGateway {
  /** The caller's flat effective permission map (for UI gating). */
  myPermissions(): Promise<Result<PermissionMap, PermissionSetError>>;

  /** The caller's accessible sidebar modules, grouped and grant-filtered (drives the left nav). */
  myPermissionModules(): Promise<Result<readonly SidebarGroup[], PermissionSetError>>;

  listSets(): Promise<Result<readonly PermissionSetSummary[], PermissionSetError>>;
  getSet(id: string): Promise<Result<PermissionSetDetail, PermissionSetError>>;
  createSet(
    input: CreatePermissionSetInput,
  ): Promise<Result<PermissionSetDetail, PermissionSetError>>;
  updateSet(
    id: string,
    input: UpdatePermissionSetInput,
  ): Promise<Result<PermissionSetDetail, PermissionSetError>>;
  deleteSet(id: string): Promise<Result<void, PermissionSetError>>;

  typeDefaults(): Promise<Result<readonly UserTypeDefault[], PermissionSetError>>;
  setTypeDefault(
    userTypeId: string,
    permissionSetRoleId: string,
    applyToExistingUsers: boolean,
  ): Promise<Result<void, PermissionSetError>>;

  userPermissions(
    userId: string,
  ): Promise<Result<UserEffectivePermissions, PermissionSetError>>;
  /** Assign (or clear, with `null`) a user's own permission-set role. */
  setUserPermissionSet(
    userId: string,
    permissionSetRoleId: string | null,
  ): Promise<Result<void, PermissionSetError>>;
  updateUserGrants(
    userId: string,
    permissions: PermissionMap,
  ): Promise<Result<PermissionUpdateResult, PermissionSetError>>;
  replaceUserDenies(
    userId: string,
    deniedPermissions: readonly string[],
  ): Promise<Result<PermissionUpdateResult, PermissionSetError>>;
}
