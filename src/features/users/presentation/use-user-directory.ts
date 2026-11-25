import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { useToast } from '@shared/ui';
import type { BranchListItem, BranchUser, BranchUserPage } from '../domain';
import { useUsersModule } from './use-users-module';

const DIRECTORY_ROOT = ['users', 'directory'] as const;
export const userDirectoryKey = (
  branchId: string | null,
  userTypeId?: string | null,
): readonly string[] => [...DIRECTORY_ROOT, branchId ?? 'all', userTypeId ?? 'all'];
export const branchesKey = ['users', 'branches'] as const;

export const DIRECTORY_PAGE_SIZE = 20;

/** Every user in the chosen branch and/or user type (all pages), or across all accessible when null. */
export function useBranchUsers(
  branchId: string | null,
  userTypeId?: string | null,
  enabled?: boolean,
): UseQueryResult<readonly BranchUser[]>;
export function useBranchUsers(
  branchId: string | null,
  enabled?: boolean,
): UseQueryResult<readonly BranchUser[]>;
export function useBranchUsers(
  branchId: string | null,
  userTypeIdOrEnabled?: string | null | boolean,
  enabledArg?: boolean,
): UseQueryResult<readonly BranchUser[]> {
  const isSecondArgBoolean = typeof userTypeIdOrEnabled === 'boolean';
  const userTypeId = isSecondArgBoolean ? null : (userTypeIdOrEnabled ?? null);
  const enabled = isSecondArgBoolean ? userTypeIdOrEnabled : (enabledArg ?? true);

  const { gateway } = useUsersModule();
  return useQuery({
    queryKey: userDirectoryKey(branchId, userTypeId),
    enabled,
    queryFn: () => gateway.listUsers({ branchId, userTypeId }),
  });
}

const matchesSearch = (user: BranchUser, needle: string): boolean =>
  [user.name, user.userName, user.email].some(
    (value) => value?.toLowerCase().includes(needle) === true,
  );

export interface UserDirectoryPageParams {
  readonly branchId: string | null;
  readonly userTypeId: string | null;
  readonly search: string;
  /** Zero-based page index. */
  readonly page: number;
}

/**
 * One page of the directory. Browsing is paged on the server; the API has no text filter, so an
 * active search loads the whole matching set once, filters it here, and pages the result locally.
 */
export const useBranchUsersPage = ({
  branchId,
  userTypeId,
  search,
  page,
}: UserDirectoryPageParams): UseQueryResult<BranchUserPage> => {
  const { gateway } = useUsersModule();
  const needle = search.trim().toLowerCase();
  const filter = { branchId, userTypeId };
  return useQuery({
    queryKey: [
      ...userDirectoryKey(branchId, userTypeId),
      needle === '' ? `page-${String(page)}` : `search-${needle}`,
    ],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<BranchUserPage> => {
      if (needle === '') {
        return gateway.listUsersPage(filter, page, DIRECTORY_PAGE_SIZE);
      }
      const all = (await gateway.listUsers(filter)).filter((user) =>
        matchesSearch(user, needle),
      );
      return { items: all, totalCount: all.length };
    },
    select: (result) =>
      needle === ''
        ? result
        : {
            totalCount: result.totalCount,
            items: result.items.slice(
              page * DIRECTORY_PAGE_SIZE,
              (page + 1) * DIRECTORY_PAGE_SIZE,
            ),
          },
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
