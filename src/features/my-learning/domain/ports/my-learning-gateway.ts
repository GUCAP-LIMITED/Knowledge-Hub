import type { Result } from '@core/result';
import type { MyLearningItem } from '../entities/my-learning-item';
import type {
  MyLearningQueryParams,
  MyLearningStats,
  MyLearningStatusOption,
} from '../types';

export interface PagedMyLearningResult {
  readonly items: readonly MyLearningItem[];
  readonly totalCount: number;
}

export interface MyLearningGateway {
  getMyLearning(params: MyLearningQueryParams): Promise<Result<PagedMyLearningResult>>;
  getStats(): Promise<Result<MyLearningStats>>;
  getMyLearningStatuses(): Promise<Result<readonly MyLearningStatusOption[]>>;
}
