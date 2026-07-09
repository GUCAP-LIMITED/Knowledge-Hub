import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { isErr } from '@core/result';
import type { UserAccount } from '../domain';
import { useUsersModule } from './use-users-module';

/** Stable query key for the user directory. */
export const usersQueryKey = ['users'] as const;

/** List query. Unwraps the domain `Result`, throwing the `AppError` so Query surfaces it. */
export const useUsers = (): UseQueryResult<readonly UserAccount[]> => {
  const { listUsers } = useUsersModule();

  return useQuery({
    queryKey: usersQueryKey,
    queryFn: async (): Promise<readonly UserAccount[]> => {
      const result = await listUsers.execute();
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};
