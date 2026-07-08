import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { isErr } from '@core/result';
import type { Course } from '../domain';
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
