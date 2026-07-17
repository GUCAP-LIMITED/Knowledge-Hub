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
  DuplicateUserTypeNameError,
  SeededUserTypeImmutableError,
  UserTypeInUseError,
  UserTypesUnavailableError,
} from '../domain';
import {
  SelectableListDtoSchema,
  UserTypeDtoSchema,
  UserTypeListDtoSchema,
} from './dto/user-type-api.dto';
import { toSelectableUserType, toUserType } from './user-type-mapper';

const BASE = '/api/app/user-type';

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
      const raw = await this.httpClient.get<unknown>(BASE);
      const parsed = UserTypeListDtoSchema.safeParse(raw);
      if (!parsed.success) return this.unexpected(parsed.error);
      return ok(parsed.data.items.map(toUserType));
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

  public async selectable(
    assignableOnly: boolean,
  ): Promise<Result<readonly SelectableUserType[], UserTypeError>> {
    try {
      const raw = await this.httpClient.get<unknown>(`${BASE}/selectable`, {
        query: { assignableOnly, maxResultCount: 200 },
      });
      const parsed = SelectableListDtoSchema.safeParse(raw);
      if (!parsed.success) return this.unexpected(parsed.error);
      return ok(parsed.data.items.map(toSelectableUserType));
    } catch (cause) {
      return err(this.mapError(cause));
    }
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
