import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useCoursesModule } from './use-courses-module';
import { isErr } from '@core/result';
import type { CourseError, EnrollmentStatusDto } from '../domain';
import { coursesQueryKey } from './use-courses';

export const useEnrollmentStatuses = (): UseQueryResult<
  readonly EnrollmentStatusDto[],
  CourseError
> => {
  const module = useCoursesModule();

  return useQuery<readonly EnrollmentStatusDto[], CourseError>({
    queryKey: [...coursesQueryKey, 'enrollment-statuses'],
    queryFn: async () => {
      const result = await module.getEnrollmentStatuses.execute();
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
