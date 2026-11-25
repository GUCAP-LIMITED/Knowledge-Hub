import {
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
import { invalidateLearningCaches } from '@features/my-learning/presentation/learning-cache-sync';
import type { Course, CourseCatalogParams, PagedResult } from '../domain';
import type { UpdateCourseInput } from '../application';
import { useCoursesModule } from './use-courses-module';

/** Stable query key for the course catalog. Mutations invalidate this to refetch. */
export const coursesQueryKey = ['courses'] as const;

/** List query. Unwraps the domain `Result`, returning the items array for simple callers. */
export const useCourses = (
  params?: CourseCatalogParams,
): UseQueryResult<readonly Course[]> => {
  const { listCourses } = useCoursesModule();

  return useQuery({
    queryKey: ['courses', params] as const,
    queryFn: async (): Promise<readonly Course[]> => {
      const result = await listCourses.execute(params);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value.items;
    },
  });
};

/** Infinite list query for the paginated course catalog. */
export const useInfiniteCourses = (
  params: Omit<CourseCatalogParams, 'skipCount'>,
): UseInfiniteQueryResult<InfiniteData<PagedResult<Course>>> => {
  const { listCourses } = useCoursesModule();

  return useInfiniteQuery({
    queryKey: ['courses', 'infinite', params] as const,
    queryFn: async ({ pageParam }): Promise<PagedResult<Course>> => {
      const result = await listCourses.execute({
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
      lastPage: PagedResult<Course>,
      allPages: readonly PagedResult<Course>[],
    ): number | undefined => {
      const loadedCount = allPages.reduce(
        (total: number, page: PagedResult<Course>): number => total + page.items.length,
        0,
      );
      return loadedCount < lastPage.totalCount ? loadedCount : undefined;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const courseQueryKey = (id: string): readonly string[] => ['courses', id];

/** Single-course query for the detail page. */
export const useCourse = (id: string): UseQueryResult<Course> => {
  const { getCourse } = useCoursesModule();
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: courseQueryKey(id),
    queryFn: async (): Promise<Course> => {
      const result = await getCourse.execute(id);
      if (isErr(result)) {
        throw result.error;
      }
      if (result.value.slug && result.value.slug !== id) {
        queryClient.setQueryData(courseQueryKey(result.value.slug), result.value);
      }
      return result.value;
    },
  });
};

export interface UpdateCourseProgressInput {
  readonly id: string;
  readonly progress: number;
}

/** Mutation to record learner progress; refreshes the catalog on success. */
export const useUpdateCourseProgress = (): UseMutationResult<
  Course,
  Error,
  UpdateCourseProgressInput
> => {
  const { updateCourseProgress } = useCoursesModule();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, progress }: UpdateCourseProgressInput): Promise<Course> => {
      const result = await updateCourseProgress.execute(id, progress);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: coursesQueryKey });
    },
  });
};

/** Mutation to enroll in a course; refreshes the catalog on success. */
export const useEnrollCourse = (): UseMutationResult<Course, Error, string> => {
  const { enrollCourse } = useCoursesModule();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Course> => {
      const result = await enrollCourse.execute(id);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: coursesQueryKey });
      void invalidateLearningCaches(queryClient);
    },
  });
};

export interface MarkLessonCompleteInput {
  readonly courseId: string;
  readonly enrollmentId: string;
  readonly lessonId: string;
}

/** Mutation to mark a lesson complete; refreshes the catalog on success. */
export const useMarkLessonComplete = (): UseMutationResult<
  Course,
  Error,
  MarkLessonCompleteInput
> => {
  const { markLessonComplete } = useCoursesModule();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      enrollmentId,
      lessonId,
    }: MarkLessonCompleteInput): Promise<Course> => {
      const result = await markLessonComplete.execute(courseId, enrollmentId, lessonId);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: coursesQueryKey });
      void invalidateLearningCaches(queryClient, {
        includeCertificates: updated.isCompleted(),
      });
    },
  });
};

/** Mutation to edit a course's title/category; refreshes the catalog on success. */
export const useUpdateCourse = (): UseMutationResult<
  Course,
  Error,
  UpdateCourseInput
> => {
  const { updateCourse } = useCoursesModule();
  const queryClient = useQueryClient();
  const { success } = useToast();
  return useMutation({
    mutationFn: async (input: UpdateCourseInput): Promise<Course> => {
      const result = await updateCourse.execute(input);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => {
      success('Course updated.');
      void queryClient.invalidateQueries({ queryKey: coursesQueryKey });
    },
  });
};

/** Mutation to delete a course; refreshes the catalog on success. */
export const useDeleteCourse = (): UseMutationResult<void, Error, string> => {
  const { deleteCourse } = useCoursesModule();
  const queryClient = useQueryClient();
  const { success } = useToast();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const result = await deleteCourse.execute(id);
      if (isErr(result)) {
        throw result.error;
      }
    },
    onSuccess: () => {
      success('Course deleted.');
      void queryClient.invalidateQueries({ queryKey: coursesQueryKey });
    },
  });
};

export interface MarkCourseHelpfulInput {
  readonly id: string;
}

export interface MarkCourseHelpfulContext {
  readonly previousCourses?: readonly Course[] | undefined;
  readonly previousCourse?: Course | undefined;
}

/** Mutation to toggle helpful vote on a course with optimistic updates. */
export const useMarkCourseHelpful = (): UseMutationResult<
  Course,
  Error,
  MarkCourseHelpfulInput,
  MarkCourseHelpfulContext
> => {
  const { markCourseHelpful } = useCoursesModule();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: MarkCourseHelpfulInput): Promise<Course> => {
      const result = await markCourseHelpful.execute(id);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onMutate: async ({
      id,
    }: MarkCourseHelpfulInput): Promise<MarkCourseHelpfulContext> => {
      await queryClient.cancelQueries({ queryKey: coursesQueryKey });
      await queryClient.cancelQueries({ queryKey: courseQueryKey(id) });

      const previousCourses =
        queryClient.getQueryData<readonly Course[]>(coursesQueryKey);
      const previousCourse = queryClient.getQueryData<Course>(courseQueryKey(id));

      if (previousCourse) {
        const nextHelpful = !previousCourse.isHelpful;
        const nextCount = nextHelpful
          ? previousCourse.helpfulCount + 1
          : Math.max(0, previousCourse.helpfulCount - 1);
        queryClient.setQueryData(
          courseQueryKey(id),
          previousCourse.withHelpfulVote(nextCount, nextHelpful),
        );
      }

      if (previousCourses) {
        queryClient.setQueryData<readonly Course[]>(coursesQueryKey, (old) => {
          if (!old) return old;
          return old.map((c) => {
            if (c.id !== id) return c;
            const nextHelpful = !c.isHelpful;
            const nextCount = nextHelpful
              ? c.helpfulCount + 1
              : Math.max(0, c.helpfulCount - 1);
            return c.withHelpfulVote(nextCount, nextHelpful);
          });
        });
      }

      return { previousCourses, previousCourse };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousCourses) {
        queryClient.setQueryData(coursesQueryKey, context.previousCourses);
      }
      if (context?.previousCourse) {
        queryClient.setQueryData(courseQueryKey(id), context.previousCourse);
      }
    },
    onSuccess: (updated: Course) => {
      queryClient.setQueryData(courseQueryKey(updated.id), updated);
      queryClient.setQueryData<readonly Course[]>(coursesQueryKey, (old) => {
        if (!old) return old;
        return old.map((c) => (c.id === updated.id ? updated : c));
      });
    },
    onSettled: (_data, _error, { id }) => {
      void queryClient.invalidateQueries({ queryKey: coursesQueryKey });
      void queryClient.invalidateQueries({ queryKey: courseQueryKey(id) });
    },
  });
};
