import { type HttpClient, HttpError } from '@core/http';
import type { Logger } from '@core/logger';
import { type Result, ok, err } from '@core/result';
import { z } from 'zod';
import {
  type CreateUserTypeInput,
  type SelectableUserType,
  type UpdateUserTypeInput,
  type UserType,
  type UserTypeError,
  type UserTypeGateway,
  type UserTypeHierarchyNode,
  DuplicateUserTypeNameError,
  SeededUserTypeImmutableError,
  UserTypeInUseError,
  UserTypesUnavailableError,
} from '../domain';
import {
  SelectableListDtoSchema,
  UserTypeDtoSchema,
  UserTypeHierarchyListDtoSchema,
  UserTypeListDtoSchema,
} from './dto/user-type-api.dto';
import {
  toSelectableUserType,
  toUserType,
  toUserTypeHierarchyNode,
} from './user-type-mapper';

const BASE = '/api/app/user-type';

/** Page size per request; the backend may cap it lower, so we always page by what we received. */
const PAGE_SIZE = 100;
/** Hard stop so a misbehaving `totalCount` can never loop forever. */
const MAX_PAGES = 50;

interface Page<T> {
  readonly totalCount: number;
  readonly items: readonly T[];
}

/** Minimal ABP error envelope — just enough to read the validation message. */
const ApiErrorSchema = z.object({
  error: z.object({ message: z.string().optional() }).optional(),
});

function apiMessage(body: unknown): string {
  const parsed = ApiErrorSchema.safeParse(body);
  return parsed.success && parsed.data.error?.message ? parsed.data.error.message : '';
}

export interface UserTypeHttpGatewayDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

/** HTTP implementation of the {@link UserTypeGateway} port against `/api/app/user-type`. */
export class UserTypeHttpGateway implements UserTypeGateway {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;

  public constructor(deps: UserTypeHttpGatewayDeps) {
    this.httpClient = deps.httpClient;
    this.logger = deps.logger.child('user-type-gateway');
  }

  public async list(): Promise<Result<readonly UserType[], UserTypeError>> {
    try {
      const items = await this.fetchAll(BASE, {}, UserTypeListDtoSchema);
      if (!items.ok) return items;
      return ok(items.value.map(toUserType));
    } catch (cause) {
      return err(this.mapError(cause));
    }
  }

  public async create(
    input: CreateUserTypeInput,
  ): Promise<Result<UserType, UserTypeError>> {
    return this.writeOne(() => this.httpClient.post<unknown>(BASE, input), input.name);
  }

  public async update(
    id: string,
    input: UpdateUserTypeInput,
  ): Promise<Result<UserType, UserTypeError>> {
    return this.writeOne(
      () => this.httpClient.put<unknown>(`${BASE}/${id}`, input),
      input.name,
    );
  }

  public async reorder(
    id: string,
    hierarchyLevel: number,
  ): Promise<Result<UserType, UserTypeError>> {
    return this.writeOne(() =>
      this.httpClient.put<unknown>(`${BASE}/${id}/hierarchy-level`, { hierarchyLevel }),
    );
  }

  public async remove(id: string): Promise<Result<void, UserTypeError>> {
    try {
      await this.httpClient.delete(`${BASE}/${id}`);
      return ok(undefined);
    } catch (cause) {
      return err(this.mapError(cause));
    }
  }

  public async hierarchy(
    canLogin?: boolean,
  ): Promise<Result<readonly UserTypeHierarchyNode[], UserTypeError>> {
    try {
      const query = canLogin !== undefined ? { canLogin } : undefined;
      const raw = await this.httpClient.get<unknown>(`${BASE}/hierarchy`, {
        ...(query !== undefined ? { query } : {}),
      });
      const parsed = UserTypeHierarchyListDtoSchema.safeParse(raw);
      if (!parsed.success) return this.unexpected(parsed.error);
      return ok(parsed.data.map(toUserTypeHierarchyNode));
    } catch (cause) {
      return err(this.mapError(cause));
    }
  }

  public async selectable(
    assignableOnly: boolean,
  ): Promise<Result<readonly SelectableUserType[], UserTypeError>> {
    try {
      const items = await this.fetchAll(
        `${BASE}/selectable`,
        { assignableOnly },
        SelectableListDtoSchema,
      );
      if (!items.ok) return items;
      return ok(items.value.map(toSelectableUserType));
    } catch (cause) {
      return err(this.mapError(cause));
    }
  }

  /** Walks `skipCount` pages until `totalCount` is reached (or the server returns an empty page). */
  private async fetchAll<S extends z.ZodType<Page<unknown>>>(
    url: string,
    query: Record<string, boolean | number>,
    schema: S,
  ): Promise<Result<z.infer<S>['items'], UserTypeError>> {
    const all: z.infer<S>['items'][number][] = [];
    for (let page = 0; page < MAX_PAGES; page += 1) {
      const raw = await this.httpClient.get<unknown>(url, {
        query: { ...query, skipCount: all.length, maxResultCount: PAGE_SIZE },
      });
      const parsed = schema.safeParse(raw);
      if (!parsed.success) return this.unexpected(parsed.error);
      all.push(...parsed.data.items);
      if (parsed.data.items.length === 0 || all.length >= parsed.data.totalCount) break;
    }
    return ok(all);
  }

  private async writeOne(
    call: () => Promise<unknown>,
    name?: string,
  ): Promise<Result<UserType, UserTypeError>> {
    try {
      const raw = await call();
      const parsed = UserTypeDtoSchema.safeParse(raw);
      if (!parsed.success) return this.unexpected(parsed.error);
      return ok(toUserType(parsed.data));
    } catch (cause) {
      return err(this.mapError(cause, name));
    }
  }

  private unexpected(error: z.ZodError): Result<never, UserTypeError> {
    this.logger.error('User-types endpoint returned an unexpected shape', error);
    return err(new UserTypesUnavailableError(error));
  }

  private mapError(cause: unknown, name?: string): UserTypeError {
    if (cause instanceof HttpError && cause.status === 403) {
      const message = apiMessage(cause.body).toLowerCase();
      if (message.includes('already exists'))
        return new DuplicateUserTypeNameError(name ?? '');
      if (message.includes('assigned to users')) return new UserTypeInUseError();
      if (
        message.includes('cannot be modified') ||
        message.includes('cannot be deleted')
      ) {
        return new SeededUserTypeImmutableError();
      }
    }
    if (cause instanceof HttpError) {
      this.logger.error('User-types request failed', cause, { status: cause.status });
    } else {
      this.logger.error('User-types request failed', cause);
    }
    return new UserTypesUnavailableError(cause);
  }
}
