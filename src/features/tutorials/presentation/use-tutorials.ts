import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { isErr } from '@core/result';
import type { Tutorial } from '../domain';
import { useTutorialsModule } from './use-tutorials-module';

/** Stable query key for the tutorials library. */
export const tutorialsQueryKey = ['tutorials'] as const;

/** List query. Unwraps the domain `Result`, throwing the `AppError` so Query surfaces it. */
export const useTutorials = (): UseQueryResult<readonly Tutorial[]> => {
  const { listTutorials } = useTutorialsModule();

  return useQuery({
    queryKey: tutorialsQueryKey,
    queryFn: async (): Promise<readonly Tutorial[]> => {
      const result = await listTutorials.execute();
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};
