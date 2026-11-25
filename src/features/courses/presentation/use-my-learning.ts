import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useCoursesModule } from './use-courses-module';
import { isErr } from '@core/result';
import type { Course, CourseError, PagedResult, MyLearningParams } from '../domain';
import { coursesQueryKey } from './use-courses';

export const useMyLearning = (
  params: MyLearningParams,
): UseQueryResult<PagedResult<Course>, CourseError> => {
  const module = useCoursesModule();

  return useQuery<PagedResult<Course>, CourseError>({
    queryKey: [...coursesQueryKey, 'my-learning', params],
    queryFn: async () => {
      const result = await module.getMyLearning.execute(params);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
