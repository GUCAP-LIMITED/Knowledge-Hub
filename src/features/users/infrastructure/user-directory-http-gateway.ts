import { type HttpClient, HttpError } from '@core/http';
import type { Logger } from '@core/logger';
import type {
  BranchListItem,
  BranchUser,
  BranchUserPage,
  UserDirectoryFilter,
  UserDirectoryGateway,
} from '../domain';
import {
  BranchListDtoSchema,
  BranchUserListDtoSchema,
} from './dto/user-directory-api.dto';
import { toBranchListItem, toBranchUser } from './user-directory-mapper';

const USER_BASE = '/api/app/user';
/** Page size when walking the whole directory; the loop pages by what it actually received. */
const FETCH_ALL_PAGE_SIZE = 100;
/** Hard stop so a misbehaving `totalCount` can never loop forever. */
const MAX_PAGES = 50;

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

  public async listUsers(filter: UserDirectoryFilter): Promise<readonly BranchUser[]> {
    const all: BranchUser[] = [];
    for (let page = 0; page < MAX_PAGES; page += 1) {
      const result = await this.fetchPage(filter, all.length, FETCH_ALL_PAGE_SIZE);
      all.push(...result.items);
      if (result.items.length === 0 || all.length >= result.totalCount) break;
    }
    return all;
  }

  public async listUsersPage(
    filter: UserDirectoryFilter,
    page: number,
    pageSize: number,
  ): Promise<BranchUserPage> {
    return this.fetchPage(filter, page * pageSize, pageSize);
  }

  private async fetchPage(
    filter: UserDirectoryFilter,
    skip: number,
    take: number,
  ): Promise<BranchUserPage> {
    return this.call(async () => {
      const raw = await this.httpClient.get<unknown>('/api/app/branch/users', {
        query: {
          BranchId: filter.branchId ?? undefined,
          UserTypeId: filter.userTypeId ?? undefined,
          SkipCount: skip,
          MaxResultCount: take,
        },
      });
      const parsed = BranchUserListDtoSchema.parse(raw);
      return { items: parsed.items.map(toBranchUser), totalCount: parsed.totalCount };
    });
  }

  public async listBranches(): Promise<readonly BranchListItem[]> {
    return this.call(async () => {
      const raw = await this.httpClient.get<unknown>('/api/app/branch/my');
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
