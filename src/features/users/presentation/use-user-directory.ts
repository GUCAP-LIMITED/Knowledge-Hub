import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { useToast } from '@shared/ui';
import type { BranchListItem, BranchUser } from '../domain';
import { useUsersModule } from './use-users-module';

const DIRECTORY_ROOT = ['users', 'directory'] as const;
export const userDirectoryKey = (branchId: string | null): readonly string[] => [
  ...DIRECTORY_ROOT,
  branchId ?? 'all',
];
export const branchesKey = ['users', 'branches'] as const;

/** Users in the chosen branch, or across all accessible branches when `branchId` is null. */
export const useBranchUsers = (
  branchId: string | null,
  enabled = true,
): UseQueryResult<readonly BranchUser[]> => {
  const { gateway } = useUsersModule();
  return useQuery({
    queryKey: userDirectoryKey(branchId),
    enabled,
    queryFn: () => gateway.listUsers(branchId),
  });
};

/** Branches for the filter dropdown. */
export const useBranches = (): UseQueryResult<readonly BranchListItem[]> => {
  const { gateway } = useUsersModule();
  return useQuery({ queryKey: branchesKey, queryFn: () => gateway.listBranches() });
};

const useBlockMutation = (
  action: (
    gateway: ReturnType<typeof useUsersModule>['gateway'],
    id: string,
  ) => Promise<void>,
  message: string,
): UseMutationResult<void, Error, string> => {
  const { gateway } = useUsersModule();
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (userId: string) => action(gateway, userId),
    onSuccess: () => {
      toast.success(message);
      void queryClient.invalidateQueries({ queryKey: DIRECTORY_ROOT });
    },
  });
};

export const useBlockUser = (): UseMutationResult<void, Error, string> =>
  useBlockMutation((gateway, id) => gateway.blockUser(id), 'User blocked.');

export const useUnblockUser = (): UseMutationResult<void, Error, string> =>
  useBlockMutation((gateway, id) => gateway.unblockUser(id), 'User unblocked.');
