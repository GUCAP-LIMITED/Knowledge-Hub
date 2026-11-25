import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { isErr } from '@core/result';
import type { PagedMyLearningResult } from '../domain/ports/my-learning-gateway';
import type { MyLearningQueryParams } from '../domain/types';
import { useMyLearningModule } from './use-my-learning-module';

export const myLearningQueryKey = ['my-learning'] as const;

export const useInfiniteMyLearning = (
  params: Omit<MyLearningQueryParams, 'skipCount'>,
): UseInfiniteQueryResult<InfiniteData<PagedMyLearningResult>> => {
  const module = useMyLearningModule();

  return useInfiniteQuery({
    queryKey: ['my-learning', params] as const,
    queryFn: async ({ pageParam }): Promise<PagedMyLearningResult> => {
      const result = await module.getMyLearning.execute({
        ...params,
        skipCount: pageParam,
      });
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    initialPageParam: 0,
    getNextPageParam: (
      lastPage: PagedMyLearningResult,
      allPages: readonly PagedMyLearningResult[],
    ) => {
      const loadedCount = allPages.reduce((total, page) => total + page.items.length, 0);
      return loadedCount < lastPage.totalCount ? loadedCount : undefined;
    },
    staleTime: 1000 * 60 * 2,
  });
};
