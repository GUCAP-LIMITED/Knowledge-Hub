import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { useToast } from '@shared/ui';
import { isErr } from '@core/result';
import type { Course } from '../domain';
import type { UpdateCourseInput } from '../application';
import { useCoursesModule } from './use-courses-module';

/** Stable query key for the course catalog. Mutations invalidate this to refetch. */
export const coursesQueryKey = ['courses'] as const;

/** List query. Unwraps the domain `Result`, throwing the `AppError` so Query surfaces it. */
export const useCourses = (): UseQueryResult<readonly Course[]> => {
  const { listCourses } = useCoursesModule();

  return useQuery({
    queryKey: coursesQueryKey,
    queryFn: async (): Promise<readonly Course[]> => {
      const result = await listCourses.execute();
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};

export const courseQueryKey = (id: string): readonly string[] => ['courses', id];

/** Single-course query for the detail page. */
export const useCourse = (id: string): UseQueryResult<Course> => {
  const { getCourse } = useCoursesModule();
  return useQuery({
    queryKey: courseQueryKey(id),
    queryFn: async (): Promise<Course> => {
      const result = await getCourse.execute(id);
      if (isErr(result)) {
        throw result.error;
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
