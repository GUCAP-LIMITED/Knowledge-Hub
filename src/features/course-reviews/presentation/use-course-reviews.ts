import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type UseInfiniteQueryResult,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { useToast } from '@shared/ui';
import { isErr } from '@core/result';
import { coursesQueryKey } from '@features/courses';
import { tutorialsQueryKey } from '@features/tutorials';
import { resourcesQueryKey } from '@features/resources';
import type {
  CourseReviewStatistics,
  CourseStatisticsQuery,
  PagedResult,
  RecentReview,
  RecentReviewsQuery,
  GetReviewsQuery,
  Review,
  SelectableContentItem,
  SelectableContentParams,
} from '../domain';
import type { SubmitReviewInput } from '../application';
import { useCourseReviewsModule } from './use-course-reviews-module';
import {
  type ToggleReviewHelpfulInput,
  type ReviewSnapshots,
  resolveReviewInput,
  pendingToggleDirections,
  updateReviewList,
  syncReviewInCache,
  extractReviewsFromCache,
} from './reviews-cache-utils';

export type { ToggleReviewHelpfulInput };

/** Root key for every reviews query; mutations invalidate this prefix. */
export const reviewsQueryKey = ['course-reviews'] as const;

export const courseStatisticsQueryKey = (
  query?: CourseStatisticsQuery,
): readonly unknown[] => ['course-reviews', 'statistics', query ?? {}];

/** Course statistics (average, total reviews, breakdown, top rated courses). */
export const useCourseReviewStatistics = (
  query?: CourseStatisticsQuery,
): UseQueryResult<CourseReviewStatistics> => {
  const { getCourseStatistics } = useCourseReviewsModule();
  return useQuery({
    queryKey: courseStatisticsQueryKey(query),
    queryFn: async (): Promise<CourseReviewStatistics> => {
      const result = await getCourseStatistics.execute(query);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};

export const recentReviewsQueryKey = (query?: RecentReviewsQuery): readonly unknown[] => [
  'course-reviews',
  'recent',
  query ?? {},
];

/** Paginated recent reviews with advanced filtering. */
export const useRecentReviews = (
  query?: RecentReviewsQuery,
): UseQueryResult<PagedResult<RecentReview>> => {
  const { getRecentReviews } = useCourseReviewsModule();
  return useQuery({
    queryKey: recentReviewsQueryKey(query),
    queryFn: async (): Promise<PagedResult<RecentReview>> => {
      const result = await getRecentReviews.execute(query);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    placeholderData: keepPreviousData,
  });
};

/** Every review across courses. */
export const useAllReviews = (): UseQueryResult<readonly Review[]> => {
  const { listAllReviews } = useCourseReviewsModule();
  return useQuery({
    queryKey: reviewsQueryKey,
    queryFn: async (): Promise<readonly Review[]> => {
      const result = await listAllReviews.execute();
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};

export const courseReviewsQueryKey = (courseId: string): readonly string[] => [
  'course-reviews',
  'course',
  courseId,
];

/** Reviews for a single content item (course, tutorial, resource). */
export const useCourseReviews = (
  courseId: string,
  options?: { enabled?: boolean },
): UseQueryResult<readonly Review[]> => {
  const { listCourseReviews } = useCourseReviewsModule();
  return useQuery({
    queryKey: courseReviewsQueryKey(courseId),
    queryFn: async (): Promise<readonly Review[]> => {
      const result = await listCourseReviews.execute(courseId);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    enabled: options?.enabled ?? true,
  });
};

export const paginatedReviewsQueryKey = (query?: GetReviewsQuery): readonly unknown[] => [
  'course-reviews',
  'paginated',
  query ?? {},
];

/** Paginated reviews optionally filtered by content type and/or specific content item. */
export const useReviews = (
  query?: GetReviewsQuery,
): UseQueryResult<PagedResult<Review>> => {
  const { getReviews } = useCourseReviewsModule();
  return useQuery({
    queryKey: paginatedReviewsQueryKey(query),
    queryFn: async (): Promise<PagedResult<Review>> => {
      const result = await getReviews.execute(query);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};

export const selectableContentItemsQueryKey = (
  params?: Omit<SelectableContentParams, 'skipCount'>,
): readonly unknown[] => ['course-reviews', 'selectable-content-items', params ?? {}];

/** Infinite list query for searchable, selectable content items with fuzzy search. */
export const useInfiniteSelectableContentItems = (
  params?: Omit<SelectableContentParams, 'skipCount'>,
): UseInfiniteQueryResult<InfiniteData<PagedResult<SelectableContentItem>>> => {
  const { getSelectableContentItems } = useCourseReviewsModule();

  return useInfiniteQuery({
    queryKey: selectableContentItemsQueryKey(params),
    queryFn: async ({ pageParam }): Promise<PagedResult<SelectableContentItem>> => {
      const result = await getSelectableContentItems.execute({
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
      lastPage: PagedResult<SelectableContentItem>,
      allPages: readonly PagedResult<SelectableContentItem>[],
    ): number | undefined => {
      const loadedCount = allPages.reduce(
        (total: number, page: PagedResult<SelectableContentItem>): number =>
          total + page.items.length,
        0,
      );
      return loadedCount < lastPage.totalCount ? loadedCount : undefined;
    },
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Submitting or deleting a review changes the aggregate rating/review-count shown on the
 * course/tutorial/resource catalogs and detail pages — invalidate those alongside the reviews
 * themselves, or the catalog keeps serving stale numbers until an unrelated refetch.
 */
const useInvalidateReviews = (): (() => void) => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: reviewsQueryKey });
    void queryClient.invalidateQueries({ queryKey: coursesQueryKey });
    void queryClient.invalidateQueries({ queryKey: tutorialsQueryKey });
    void queryClient.invalidateQueries({ queryKey: resourcesQueryKey });
  };
};

export const useSubmitReview = (): UseMutationResult<
  Review,
  Error,
  SubmitReviewInput
> => {
  const { submitReview } = useCourseReviewsModule();
  const invalidate = useInvalidateReviews();
  const { success } = useToast();
  return useMutation({
    mutationFn: async (input: SubmitReviewInput): Promise<Review> => {
      const result = await submitReview.execute(input);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => {
      success('Thanks — your review was submitted.');
      invalidate();
    },
  });
};

/**
 * "Helpful" vote with an optimistic update: the count and isHelpful toggle immediately across every
 * cached review list, then rolls back if the mutation fails.
 */
export const useMarkReviewHelpful = (): UseMutationResult<
  Review,
  Error,
  ToggleReviewHelpfulInput,
  ReviewSnapshots
> => {
  const { markReviewHelpful, unmarkReviewHelpful } = useCourseReviewsModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ToggleReviewHelpfulInput): Promise<Review> => {
      const { id, isHelpful: explicitIsHelpful } = resolveReviewInput(input);
      const targetIsHelpful =
        explicitIsHelpful !== undefined
          ? !explicitIsHelpful
          : (pendingToggleDirections.get(id) ?? true);
      pendingToggleDirections.delete(id);

      const result = targetIsHelpful
        ? await markReviewHelpful.execute(id)
        : await unmarkReviewHelpful.execute(id);

      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onMutate: async (input: ToggleReviewHelpfulInput): Promise<ReviewSnapshots> => {
      const { id, isHelpful: explicitIsHelpful } = resolveReviewInput(input);
      await queryClient.cancelQueries({ queryKey: reviewsQueryKey });
      const snapshots = queryClient.getQueriesData({
        queryKey: reviewsQueryKey,
      });

      let currentlyHelpful = explicitIsHelpful;
      if (currentlyHelpful === undefined) {
        for (const [, data] of snapshots) {
          const reviews = extractReviewsFromCache(data);
          const match = reviews.find((r) => r.id === id);
          if (match !== undefined) {
            currentlyHelpful = match.isHelpful;
            break;
          }
        }
      }

      const targetIsHelpful = !(currentlyHelpful ?? false);
      pendingToggleDirections.set(id, targetIsHelpful);

      for (const [key, data] of snapshots) {
        if (data !== undefined) {
          queryClient.setQueryData(key, updateReviewList(data, id, targetIsHelpful));
        }
      }
      return snapshots;
    },
    onSuccess: (updatedReview: Review): void => {
      const snapshots = queryClient.getQueriesData({ queryKey: reviewsQueryKey });
      for (const [key, data] of snapshots) {
        if (data !== undefined) {
          queryClient.setQueryData(key, syncReviewInCache(data, updatedReview));
        }
      }
    },
    onError: (_error, input, snapshots): void => {
      const { id } = resolveReviewInput(input);
      pendingToggleDirections.delete(id);
      snapshots?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: (): void => {
      void queryClient.invalidateQueries({ queryKey: reviewsQueryKey });
    },
  });
};

export const useDeleteReview = (): UseMutationResult<void, Error, string> => {
  const { deleteReview } = useCourseReviewsModule();
  const invalidate = useInvalidateReviews();
  const { success } = useToast();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const result = await deleteReview.execute(id);
      if (isErr(result)) {
        throw result.error;
      }
    },
    onSuccess: () => {
      success('Review deleted.');
      invalidate();
    },
  });
};
