import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { useToast } from '@shared/ui';
import { isErr } from '@core/result';
import type { UserAccount } from '../domain';
import type { SetUserStatusInput } from '../application';
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

/** Mutation to activate/deactivate a user; refreshes the directory on success. */
export const useSetUserStatus = (): UseMutationResult<
  UserAccount,
  Error,
  SetUserStatusInput
> => {
  const { setUserStatus } = useUsersModule();
  const queryClient = useQueryClient();
  const { success } = useToast();
  return useMutation({
    mutationFn: async (input: SetUserStatusInput): Promise<UserAccount> => {
      const result = await setUserStatus.execute(input);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: (user: UserAccount) => {
      success(`${user.name} is now ${user.isActive() ? 'active' : 'inactive'}.`);
      void queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });
};
