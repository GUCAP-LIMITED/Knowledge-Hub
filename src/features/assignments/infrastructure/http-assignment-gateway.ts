import { type HttpClient, HttpError } from '@core/http';
import type { Logger } from '@core/logger';
import { type Result, err, ok } from '@core/result';
import { z } from 'zod';
import {
  Assignment,
  type AssignableUser,
  type AssignmentError,
  type AssignmentGateway,
  type AssignmentListFilter,
  type AssignmentListResult,
  type AssignmentStatus,
  AssignmentNotFoundError,
  AssignmentsUnavailableError,
  type NewAssignmentInput,
} from '../domain';
import type { AssigneeCategory } from '../domain';

const BASE = '/api/app/training-assignment';

const categoryToEnum: Record<number, AssigneeCategory> = {
  1: 'user',
  2: 'team',
  3: 'userType',
};

const enumToCategory: Record<AssigneeCategory, number> = {
  user: 1,
  team: 2,
  userType: 3,
};

const STATUS_MAP: Record<number, AssignmentStatus> = {
  1: 'active',
  2: 'completed',
  3: 'overdue',
};

const STATUS_NAME_TO_ENUM: Record<string, AssignmentStatus> = {
  active: 'active',
  completed: 'completed',
  overdue: 'overdue',
};

const REVERSE_STATUS_MAP: Record<AssignmentStatus, number> = {
  active: 1,
  completed: 2,
  overdue: 3,
};

const CONTENT_TYPE_CODE_MAP: Record<number, 'course' | 'tutorial' | 'resource'> = {
  0: 'course',
  5: 'tutorial',
  10: 'resource',
};

const AssignmentAssigneeRowSchema = z.object({
  category: z.number(),
  targetId: z.string(),
  displayName: z.string().optional().default(''),
  email: z.string().nullable().optional(),
});

const AssignableUserSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .nullish()
    .transform((v) => v ?? ''),
  surname: z
    .string()
    .nullish()
    .transform((v) => v ?? ''),
  email: z
    .string()
    .nullish()
    .transform((v) => v ?? ''),
  userName: z
    .string()
    .nullish()
    .transform((v) => v ?? ''),
});

const AssignmentRowSchema = z.object({
  id: z.string(),
  contentItemId: z.string().optional(),
  courseId: z.string().optional(),
  contentTitle: z.string().optional(),
  courseTitle: z.string().optional(),
  contentType: z.number().optional(),
  contentTypeName: z.string().optional(),
  assignees: z.array(AssignmentAssigneeRowSchema),
  dueDate: z.string(),
  status: z.number(),
  statusName: z.string().optional(),
  progress: z.number(),
});

type AssignmentRow = z.infer<typeof AssignmentRowSchema>;

/** Create responses may omit some fields; only `id` is required to treat the 2xx as a success. */
const CreatedAssignmentRowSchema = AssignmentRowSchema.partial().extend({
  id: z.string(),
});

/** Prefer the server's `statusName` (the source of truth); fall back to the numeric code. */
const statusFromRow = (row: AssignmentRow): AssignmentStatus => {
  const statusName = row.statusName?.toLowerCase();
  const byName = statusName === undefined ? undefined : STATUS_NAME_TO_ENUM[statusName];
  return byName ?? STATUS_MAP[row.status] ?? 'active';
};

const toAssignment = (row: AssignmentRow): Assignment => {
  const contentItemId = row.contentItemId ?? row.courseId ?? '';
  const contentTitle = row.contentTitle ?? row.courseTitle ?? 'Unknown Content';
  const contentType =
    row.contentType !== undefined ? CONTENT_TYPE_CODE_MAP[row.contentType] : undefined;

  return new Assignment({
    id: row.id,
    contentItemId,
    contentTitle,
    contentType,
    contentTypeName: row.contentTypeName,
    assignees: row.assignees.map((a) => ({
      category: categoryToEnum[a.category] ?? 'user',
      targetId: a.targetId,
      displayName: a.displayName || (a.email ?? a.targetId),
      email: a.email ?? undefined,
    })),
    dueDate: new Date(row.dueDate),
    status: statusFromRow(row),
    progress: row.progress,
  });
};

const parseAssignmentListResult = (raw: unknown): AssignmentListResult => {
  const isArray = Array.isArray(raw);
  const items = isArray ? raw : ((raw as { items?: unknown[] }).items ?? []);
  const parsedItems = z.array(AssignmentRowSchema).parse(items).map(toAssignment);

  if (isArray) {
    return {
      items: parsedItems,
      totalCount: parsedItems.length,
      activeCount: parsedItems.filter((i) => i.status === 'active').length,
      completedCount: parsedItems.filter((i) => i.status === 'completed').length,
      overdueCount: parsedItems.filter((i) => i.status === 'overdue').length,
    };
  }

  const p = raw as Record<string, number | undefined>;
  return {
    items: parsedItems,
    totalCount: p.totalCount ?? parsedItems.length,
    activeCount: p.activeCount ?? 0,
    completedCount: p.completedCount ?? 0,
    overdueCount: p.overdueCount ?? 0,
  };
};

export interface HttpAssignmentGatewayDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

export class HttpAssignmentGateway implements AssignmentGateway {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;

  public constructor(deps: HttpAssignmentGatewayDeps) {
    this.httpClient = deps.httpClient;
    this.logger = deps.logger.child('assignment-gateway');
  }

  public async list(
    filter?: AssignmentListFilter,
  ): Promise<Result<AssignmentListResult, AssignmentError>> {
    return this.guard(async () => {
      const query: {
        status?: string;
        search?: string;
        skipCount?: string;
        maxResultCount?: string;
      } = {};
      if (filter?.status !== undefined) {
        query.status = filter.status;
      }
      if (filter?.search !== undefined && filter.search !== '') {
        query.search = filter.search;
      }
      if (filter?.skipCount !== undefined) {
        query.skipCount = String(filter.skipCount);
      }
      if (filter?.maxResultCount !== undefined) {
        query.maxResultCount = String(filter.maxResultCount);
      }
      const options = Object.keys(query).length > 0 ? { query } : undefined;
      const raw = await this.httpClient.get<unknown>(BASE, options);
      return parseAssignmentListResult(raw);
    });
  }

  public async create(
    input: NewAssignmentInput,
  ): Promise<Result<Assignment, AssignmentError>> {
    return this.guard(async () => {
      const created = CreatedAssignmentRowSchema.parse(
        await this.httpClient.post(BASE, {
          contentItemId: input.contentItemId,
          courseId: input.contentItemId,
          assignees: input.assignees.map((a) => ({
            category: enumToCategory[a.category],
            targetId: a.targetId,
            displayName: a.displayName,
          })),
          dueDate: input.dueDate.toISOString(),
          status: REVERSE_STATUS_MAP[input.status],
          progress: 0,
        }),
      );
      return toAssignment({
        id: created.id,
        contentItemId: created.contentItemId ?? created.courseId ?? input.contentItemId,
        contentTitle: created.contentTitle ?? created.courseTitle,
        contentType: created.contentType,
        contentTypeName: created.contentTypeName,
        assignees:
          created.assignees?.map((a) => ({
            category: a.category,
            targetId: a.targetId,
            displayName: a.displayName,
            email: a.email,
          })) ??
          input.assignees.map((a) => ({
            category: enumToCategory[a.category],
            targetId: a.targetId,
            displayName: a.displayName,
            email: undefined,
          })),
        dueDate: created.dueDate ?? input.dueDate.toISOString(),
        status: created.status ?? REVERSE_STATUS_MAP[input.status],
        statusName: created.statusName,
        progress: created.progress ?? 0,
      });
    });
  }

  public async remove(id: string): Promise<Result<void, AssignmentError>> {
    return this.guard(async () => {
      await this.httpClient.delete(`${BASE}/${id}`);
    });
  }

  public async searchUsers(
    filter?: string,
    maxResultCount = 20,
  ): Promise<Result<readonly AssignableUser[], AssignmentError>> {
    return this.guard(async () => {
      const query: Record<string, string> = {
        maxResultCount: String(maxResultCount),
      };
      if (filter !== undefined && filter.trim() !== '') {
        query.filter = filter.trim();
      }
      const raw = await this.httpClient.get<unknown>(`${BASE}/assignable-users`, {
        query,
      });
      const items =
        (raw as { items?: unknown[] } | undefined)?.items ??
        (Array.isArray(raw) ? raw : []);
      return z.array(AssignableUserSchema).parse(items);
    });
  }

  private async guard<T>(fn: () => Promise<T>): Promise<Result<T, AssignmentError>> {
    try {
      return ok(await fn());
    } catch (cause) {
      const status = cause instanceof HttpError ? cause.status : undefined;
      this.logger.error('Assignment request failed', cause, { status });
      if (status === 404) {
        return err(new AssignmentNotFoundError('API returned 404'));
      }
      return err(new AssignmentsUnavailableError(cause, this.messageFor(cause)));
    }
  }

  private messageFor(cause: unknown): string {
    if (cause instanceof HttpError) {
      const body = cause.body as { error?: { message?: string } } | undefined;
      const message = body?.error?.message;
      return message !== undefined && message.length > 0
        ? message
        : `Request failed (${String(cause.status)}).`;
    }
    return cause instanceof Error ? cause.message : 'Something went wrong.';
  }
}
