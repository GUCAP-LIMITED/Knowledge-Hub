import { type HttpClient, HttpError } from '@core/http';
import type { Logger } from '@core/logger';
import { type Result, ok, err } from '@core/result';
import { z } from 'zod';
import {
  type CreatePermissionSetInput,
  type PermissionMap,
  type PermissionSetDetail,
  type PermissionSetError,
  type PermissionSetSummary,
  type PermissionUpdateResult,
  type PermissionsGateway,
  type SidebarGroup,
  type UpdatePermissionSetInput,
  type UserEffectivePermissions,
  type UserTypeDefault,
  PermissionOperationError,
  PermissionsUnavailableError,
} from '../domain';
import {
  MyPermissionModulesDtoSchema,
  MyPermissionsDtoSchema,
  PermissionSetDetailDtoSchema,
  PermissionSetListDtoSchema,
  PermissionUpdateResultDtoSchema,
  UserEffectivePermissionsDtoSchema,
  UserTypeDefaultListDtoSchema,
} from './dto/permission-set-api.dto';
import {
  toPermissionSetDetail,
  toPermissionSetSummary,
  toSidebarGroup,
  toUserEffectivePermissions,
  toUserTypeDefault,
} from './permission-set-mapper';

const ApiErrorSchema = z.object({
  error: z.object({ message: z.string().optional() }).optional(),
});

function apiMessage(body: unknown): string {
  const parsed = ApiErrorSchema.safeParse(body);
  return parsed.success && parsed.data.error?.message ? parsed.data.error.message : '';
}

export interface PermissionSetHttpGatewayDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

/** HTTP implementation of the {@link PermissionsGateway} port. */
export class PermissionSetHttpGateway implements PermissionsGateway {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;

  public constructor(deps: PermissionSetHttpGatewayDeps) {
    this.httpClient = deps.httpClient;
    this.logger = deps.logger.child('permissions-gateway');
  }

  public async myPermissions(): Promise<Result<PermissionMap, PermissionSetError>> {
    return this.read('/api/app/my/permissions', MyPermissionsDtoSchema, (d) => d);
  }

  public async myPermissionModules(): Promise<
    Result<readonly SidebarGroup[], PermissionSetError>
  > {
    return this.read(
      '/api/app/my/permission-modules',
      MyPermissionModulesDtoSchema,
      (groups) => groups.map(toSidebarGroup),
    );
  }

  public async listSets(): Promise<
    Result<readonly PermissionSetSummary[], PermissionSetError>
  > {
    return this.read('/api/app/permission-sets', PermissionSetListDtoSchema, (d) =>
      (Array.isArray(d) ? d : d.items).map(toPermissionSetSummary),
    );
  }

  public async getSet(
    id: string,
  ): Promise<Result<PermissionSetDetail, PermissionSetError>> {
    return this.read(
      `/api/app/permission-sets/${id}`,
      PermissionSetDetailDtoSchema,
      toPermissionSetDetail,
    );
  }

  public async createSet(
    input: CreatePermissionSetInput,
  ): Promise<Result<PermissionSetDetail, PermissionSetError>> {
    return this.write(
      () => this.httpClient.post<unknown>('/api/app/permission-sets', input),
      PermissionSetDetailDtoSchema,
      toPermissionSetDetail,
    );
  }

  public async updateSet(
    id: string,
    input: UpdatePermissionSetInput,
  ): Promise<Result<PermissionSetDetail, PermissionSetError>> {
    return this.write(
      () => this.httpClient.put<unknown>(`/api/app/permission-sets/${id}`, input),
      PermissionSetDetailDtoSchema,
      toPermissionSetDetail,
    );
  }

  public async deleteSet(id: string): Promise<Result<void, PermissionSetError>> {
    return this.voidWrite(() => this.httpClient.delete(`/api/app/permission-sets/${id}`));
  }

  public async typeDefaults(): Promise<
    Result<readonly UserTypeDefault[], PermissionSetError>
  > {
    return this.read(
      '/api/app/user-types/permission-defaults',
      UserTypeDefaultListDtoSchema,
      (d) => (Array.isArray(d) ? d : d.items).map(toUserTypeDefault),
    );
  }

  public async setTypeDefault(
    userTypeId: string,
    permissionSetRoleId: string,
    applyToExistingUsers: boolean,
  ): Promise<Result<void, PermissionSetError>> {
    return this.voidWrite(() =>
      this.httpClient.put(`/api/app/user-types/${userTypeId}/permission-default`, {
        permissionSetRoleId,
        applyToExistingUsers,
      }),
    );
  }

  public async userPermissions(
    userId: string,
  ): Promise<Result<UserEffectivePermissions, PermissionSetError>> {
    return this.read(
      `/api/app/users/${userId}/permissions`,
      UserEffectivePermissionsDtoSchema,
      toUserEffectivePermissions,
    );
  }

  public async setUserPermissionSet(
    userId: string,
    permissionSetRoleId: string | null,
  ): Promise<Result<void, PermissionSetError>> {
    return this.voidWrite(() =>
      this.httpClient.put(`/api/app/users/${userId}/permission-set`, {
        permissionSetRoleId,
      }),
    );
  }

  public async updateUserGrants(
    userId: string,
    permissions: PermissionMap,
  ): Promise<Result<PermissionUpdateResult, PermissionSetError>> {
    return this.write(
      () =>
        this.httpClient.put<unknown>(`/api/app/users/${userId}/permissions`, {
          permissions,
        }),
      PermissionUpdateResultDtoSchema,
      (d) => d,
    );
  }

  public async replaceUserDenies(
    userId: string,
    deniedPermissions: readonly string[],
  ): Promise<Result<PermissionUpdateResult, PermissionSetError>> {
    return this.write(
      () =>
        this.httpClient.put<unknown>(`/api/app/users/${userId}/permission-denies`, {
          deniedPermissions,
        }),
      PermissionUpdateResultDtoSchema,
      (d) => d,
    );
  }

  private async read<TIn, TOut>(
    path: string,
    schema: z.ZodType<TIn>,
    map: (data: TIn) => TOut,
  ): Promise<Result<TOut, PermissionSetError>> {
    return this.write(() => this.httpClient.get<unknown>(path), schema, map);
  }

  private async write<TIn, TOut>(
    call: () => Promise<unknown>,
    schema: z.ZodType<TIn>,
    map: (data: TIn) => TOut,
  ): Promise<Result<TOut, PermissionSetError>> {
    try {
      const parsed = schema.safeParse(await call());
      if (!parsed.success) {
        this.logger.error(
          'Permissions endpoint returned an unexpected shape',
          parsed.error,
        );
        return err(new PermissionsUnavailableError(parsed.error));
      }
      return ok(map(parsed.data));
    } catch (cause) {
      return err(this.mapError(cause));
    }
  }

  private async voidWrite(
    call: () => Promise<unknown>,
  ): Promise<Result<void, PermissionSetError>> {
    try {
      await call();
      return ok(undefined);
    } catch (cause) {
      return err(this.mapError(cause));
    }
  }

  private mapError(cause: unknown): PermissionSetError {
    if (cause instanceof HttpError && (cause.status === 400 || cause.status === 403)) {
      const message = apiMessage(cause.body);
      if (message.length > 0) return new PermissionOperationError(message);
    }
    if (cause instanceof HttpError) {
      this.logger.error('Permissions request failed', cause, { status: cause.status });
    } else {
      this.logger.error('Permissions request failed', cause);
    }
    return new PermissionsUnavailableError(cause);
  }
}
