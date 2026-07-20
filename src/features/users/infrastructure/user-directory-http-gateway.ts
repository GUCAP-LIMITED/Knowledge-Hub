import { type HttpClient, HttpError } from '@core/http';
import type { Logger } from '@core/logger';
import type { BranchListItem, BranchUser, UserDirectoryGateway } from '../domain';
import {
  BranchListDtoSchema,
  BranchUserListDtoSchema,
} from './dto/user-directory-api.dto';
import { toBranchListItem, toBranchUser } from './user-directory-mapper';

const USER_BASE = '/api/app/user';

export interface UserDirectoryHttpGatewayDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

/** HTTP adapter for the user directory. Unwraps the ABP error envelope into a plain Error message. */
export class UserDirectoryHttpGateway implements UserDirectoryGateway {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;

  public constructor(deps: UserDirectoryHttpGatewayDeps) {
    this.httpClient = deps.httpClient;
    this.logger = deps.logger.child('user-directory-gateway');
  }

  public async listUsers(branchId: string | null): Promise<readonly BranchUser[]> {
    return this.call(async () => {
      const raw = await this.httpClient.get<unknown>('/api/app/branch/users', {
        query: { BranchId: branchId ?? undefined, MaxResultCount: 200 },
      });
      return BranchUserListDtoSchema.parse(raw).items.map(toBranchUser);
    });
  }

  public async listBranches(): Promise<readonly BranchListItem[]> {
    return this.call(async () => {
      const raw = await this.httpClient.get<unknown>('/api/app/branch');
      return BranchListDtoSchema.parse(raw).items.map(toBranchListItem);
    });
  }

  public async blockUser(userId: string): Promise<void> {
    await this.call(async () => {
      await this.httpClient.post(`${USER_BASE}/${userId}/block`);
    });
  }

  public async unblockUser(userId: string): Promise<void> {
    await this.call(async () => {
      await this.httpClient.post(`${USER_BASE}/${userId}/unblock`);
    });
  }

  private async call<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (cause) {
      throw new Error(this.messageFor(cause));
    }
  }

  private messageFor(cause: unknown): string {
    if (cause instanceof HttpError) {
      const body = cause.body as { error?: { message?: string } } | undefined;
      const message = body?.error?.message;
      this.logger.error('User directory request failed', cause, { status: cause.status });
      return message !== undefined && message.length > 0
        ? message
        : `Request failed (${String(cause.status)}).`;
    }
    this.logger.error('User directory request failed', cause);
    return cause instanceof Error ? cause.message : 'Something went wrong.';
  }
}
