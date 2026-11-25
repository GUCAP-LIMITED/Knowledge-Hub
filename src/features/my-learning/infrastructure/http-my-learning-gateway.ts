import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import { type Result, err, ok } from '@core/result';
import { UnexpectedError } from '@core/errors/app-error';
import { z } from 'zod';
import type {
  MyLearningGateway,
  PagedMyLearningResult,
} from '../domain/ports/my-learning-gateway';
import type {
  MyLearningQueryParams,
  MyLearningStats,
  MyLearningStatusOption,
} from '../domain/types';
import {
  MyLearningItemRowSchema,
  MyLearningStatsRowSchema,
} from './dto/my-learning-api.dto';
import { toMyLearningItem, toMyLearningStats } from './my-learning-mapper';

const BASE = '/api/app/my-learning';

export const FALLBACK_MY_LEARNING_STATUSES: readonly MyLearningStatusOption[] = [
  { value: 0, name: 'NotStarted', label: 'Not Started' },
  { value: 1, name: 'InProgress', label: 'In Progress' },
  { value: 2, name: 'Completed', label: 'Completed' },
  { value: 3, name: 'Overdue', label: 'Overdue' },
  { value: 4, name: 'Paused', label: 'Paused' },
];

const EnumValueDtoSchema = z.object({
  value: z.number(),
  name: z.string(),
  description: z.string().optional().default(''),
});
const EnumResponseSchema = z.array(EnumValueDtoSchema);

export interface HttpMyLearningGatewayDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

export class HttpMyLearningGateway implements MyLearningGateway {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;

  public constructor(deps: HttpMyLearningGatewayDeps) {
    this.httpClient = deps.httpClient;
    this.logger = deps.logger.child('http-my-learning-gateway');
  }

  public async getMyLearning(
    params: MyLearningQueryParams,
  ): Promise<Result<PagedMyLearningResult>> {
    try {
      const query = new URLSearchParams();
      query.append('skipCount', params.skipCount.toString());
      query.append('maxResultCount', params.maxResultCount.toString());

      if (params.filter) {
        query.append('filter', params.filter);
      }
      if (params.origin !== undefined) {
        query.append('origin', params.origin.toString());
      }
      if (params.assignedScope !== undefined) {
        query.append('assignedScope', params.assignedScope.toString());
      }
      if (params.contentType !== undefined) {
        query.append('contentType', params.contentType.toString());
      }
      if (params.status !== undefined) {
        query.append('status', params.status.toString());
      }
      if (params.sorting) {
        query.append('sorting', params.sorting);
      }

      const raw = await this.httpClient.get<unknown>(
        `${BASE}/my-learning?${query.toString()}`,
      );

      const PagedResponseSchema = z.object({
        items: z.array(MyLearningItemRowSchema),
        totalCount: z.number(),
      });
      const parsed = PagedResponseSchema.parse(raw);
      const items = parsed.items.map(toMyLearningItem);

      return ok({
        items,
        totalCount: parsed.totalCount,
      });
    } catch (error) {
      this.logger.error('Failed to fetch my learning items', { error });
      return err(UnexpectedError.from(error));
    }
  }

  public async getStats(): Promise<Result<MyLearningStats>> {
    try {
      const raw = await this.httpClient.get<unknown>(`${BASE}/stats`);
      const row = MyLearningStatsRowSchema.parse(raw);
      return ok(toMyLearningStats(row));
    } catch (error) {
      this.logger.error('Failed to fetch my learning stats', { error });
      return err(UnexpectedError.from(error));
    }
  }

  public async getMyLearningStatuses(): Promise<
    Result<readonly MyLearningStatusOption[]>
  > {
    try {
      const raw = await this.httpClient.get<unknown>('/api/app/enum/MyLearningStatus');
      const parsed = EnumResponseSchema.parse(raw);
      const statuses: MyLearningStatusOption[] = parsed
        .slice()
        .sort((a, b) => a.value - b.value)
        .map((item) => ({
          value: item.value,
          name: item.name,
          label:
            item.description && item.description.trim() !== ''
              ? item.description
              : item.name,
        }));

      return ok(statuses);
    } catch (error) {
      this.logger.warn(
        'Failed to fetch enum MyLearningStatus from backend; using fallback',
        {
          error,
        },
      );
      return ok(FALLBACK_MY_LEARNING_STATUSES);
    }
  }
}
