import {
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { isErr } from '@core/result';
import type {
  ApprovalStatusCounts,
  PagedSubmissionsResult,
  SubmissionQueryParams,
} from '../domain';
import { useSubmissionsModule } from './use-submissions-module';

export const useInfiniteSubmissions = (
  params: Omit<SubmissionQueryParams, 'skipCount'>,
  options?: { readonly enabled?: boolean },
): UseInfiniteQueryResult<InfiniteData<PagedSubmissionsResult>> => {
  const { listSubmissions } = useSubmissionsModule();

  return useInfiniteQuery({
    queryKey: ['submissions', 'infinite', params] as const,
    queryFn: async ({ pageParam }): Promise<PagedSubmissionsResult> => {
      const result = await listSubmissions.executePaged({
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
      lastPage: PagedSubmissionsResult,
      allPages: readonly PagedSubmissionsResult[],
    ): number | undefined => {
      const loadedCount = allPages.reduce((total, page) => total + page.items.length, 0);
      return loadedCount < lastPage.totalCount ? loadedCount : undefined;
    },
    staleTime: 1000 * 30,
    enabled: options?.enabled ?? true,
  });
};

export const useApprovalStatusCounts = (
  params: Pick<SubmissionQueryParams, 'filter' | 'type'>,
): UseQueryResult<ApprovalStatusCounts> => {
  const { listSubmissions } = useSubmissionsModule();

  return useQuery({
    queryKey: ['submissions', 'status-counts', params] as const,
    queryFn: async (): Promise<ApprovalStatusCounts> => {
      const result = await listSubmissions.getStatusCounts(params);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    staleTime: 1000 * 30,
  });
};
