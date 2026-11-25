import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query';
import {
  contentKeys,
  type ContentRevision,
  type ReviewQueueParams,
  useContentModule,
} from '@features/content';

export interface PagedRevisionsResult {
  readonly items: readonly ContentRevision[];
  readonly totalCount: number;
}

export const useInfiniteRevisions = (
  params: Omit<ReviewQueueParams, 'skipCount'>,
): UseInfiniteQueryResult<InfiniteData<PagedRevisionsResult>> => {
  const { gateway } = useContentModule();

  return useInfiniteQuery({
    queryKey: [...contentKeys.pendingRevisions, 'infinite', params] as const,
    queryFn: async ({ pageParam }): Promise<PagedRevisionsResult> => {
      return await gateway.getReviewQueue({
        ...params,
        skipCount: pageParam,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (
      lastPage: PagedRevisionsResult,
      allPages: readonly PagedRevisionsResult[],
    ): number | undefined => {
      const loadedCount = allPages.reduce((total, page) => total + page.items.length, 0);
      return loadedCount < lastPage.totalCount ? loadedCount : undefined;
    },
    staleTime: 1000 * 30,
  });
};
