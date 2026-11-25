import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { isErr } from '@core/result';
import type {
  CreatePermissionSetInput,
  PermissionMap,
  PermissionSetDetail,
  PermissionSetSummary,
  PermissionUpdateResult,
  SidebarGroup,
  UpdatePermissionSetInput,
  UserEffectivePermissions,
  UserTypeDefault,
} from '../domain';
import type { SetTypeDefaultInput } from '../application';
import { usePermissionsModule } from './use-permissions-module';

export const permissionKeys = {
  all: ['permissions'] as const,
  mine: ['permissions', 'me'] as const,
  myModules: ['permissions', 'my-modules'] as const,
  sets: ['permission-sets'] as const,
  set: (id: string) => ['permission-sets', id] as const,
  typeDefaults: ['permission-type-defaults'] as const,
  users: ['user-permissions'] as const,
  user: (userId: string) => ['user-permissions', userId] as const,
};

/** Always fetch fresh permissions: never consider stale, refetch on mount, focus, and reconnect. */
export const PERMISSION_QUERY_OPTIONS = {
  staleTime: 0,
  refetchOnMount: 'always' as const,
  refetchOnWindowFocus: 'always' as const,
  refetchOnReconnect: 'always' as const,
};

interface Invalidator {
  invalidateQueries: (filters: {
    readonly queryKey: readonly unknown[];
  }) => Promise<void>;
}

export const invalidateAllPermissions = (
  queryClient: Invalidator,
  userId?: string,
  setId?: string,
): void => {
  void queryClient.invalidateQueries({ queryKey: permissionKeys.all });
  void queryClient.invalidateQueries({ queryKey: permissionKeys.sets });
  if (setId) void queryClient.invalidateQueries({ queryKey: permissionKeys.set(setId) });
  void queryClient.invalidateQueries({ queryKey: permissionKeys.typeDefaults });
  void queryClient.invalidateQueries({ queryKey: permissionKeys.users });
  if (userId)
    void queryClient.invalidateQueries({ queryKey: permissionKeys.user(userId) });
};

/** The caller's effective permission map — the API-backed source of capability gating. */
export const useMyPermissions = (): UseQueryResult<PermissionMap> => {
  const { getMyPermissions } = usePermissionsModule();
  return useQuery({
    queryKey: permissionKeys.mine,
    ...PERMISSION_QUERY_OPTIONS,
    queryFn: async (): Promise<PermissionMap> => {
      const result = await getMyPermissions.execute();
      if (isErr(result)) throw result.error;
      return result.value;
    },
  });
};

/** The caller's accessible sidebar modules (groups → items), grant-filtered — drives the left nav. */
export const useMyPermissionModules = (): UseQueryResult<readonly SidebarGroup[]> => {
  const { getMyPermissionModules } = usePermissionsModule();
  return useQuery({
    queryKey: permissionKeys.myModules,
    ...PERMISSION_QUERY_OPTIONS,
    queryFn: async (): Promise<readonly SidebarGroup[]> => {
      const result = await getMyPermissionModules.execute();
      if (isErr(result)) throw result.error;
      return result.value;
    },
  });
};

export const usePermissionSets = (): UseQueryResult<readonly PermissionSetSummary[]> => {
  const { listPermissionSets } = usePermissionsModule();
  return useQuery({
    queryKey: permissionKeys.sets,
    ...PERMISSION_QUERY_OPTIONS,
    queryFn: async (): Promise<readonly PermissionSetSummary[]> => {
      const result = await listPermissionSets.execute();
      if (isErr(result)) throw result.error;
      return result.value;
    },
  });
};

export const usePermissionSet = (id: string): UseQueryResult<PermissionSetDetail> => {
  const { getPermissionSet } = usePermissionsModule();
  return useQuery({
    queryKey: permissionKeys.set(id),
    enabled: id.length > 0,
    ...PERMISSION_QUERY_OPTIONS,
    queryFn: async (): Promise<PermissionSetDetail> => {
      const result = await getPermissionSet.execute(id);
      if (isErr(result)) throw result.error;
      return result.value;
    },
  });
};

export const useTypeDefaults = (): UseQueryResult<readonly UserTypeDefault[]> => {
  const { listTypeDefaults } = usePermissionsModule();
  return useQuery({
    queryKey: permissionKeys.typeDefaults,
    ...PERMISSION_QUERY_OPTIONS,
    queryFn: async (): Promise<readonly UserTypeDefault[]> => {
      const result = await listTypeDefaults.execute();
      if (isErr(result)) throw result.error;
      return result.value;
    },
  });
};

export const useCreatePermissionSet = (): UseMutationResult<
  PermissionSetDetail,
  Error,
  CreatePermissionSetInput
> => {
  const { createPermissionSet } = usePermissionsModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePermissionSetInput): Promise<PermissionSetDetail> => {
      const result = await createPermissionSet.execute(input);
      if (isErr(result)) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      invalidateAllPermissions(queryClient);
    },
  });
};

export interface UpdatePermissionSetVars {
  readonly id: string;
  readonly input: UpdatePermissionSetInput;
}

export const useUpdatePermissionSet = (): UseMutationResult<
  PermissionSetDetail,
  Error,
  UpdatePermissionSetVars
> => {
  const { updatePermissionSet } = usePermissionsModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: UpdatePermissionSetVars): Promise<PermissionSetDetail> => {
      const result = await updatePermissionSet.execute(id, input);
      if (isErr(result)) throw result.error;
      return result.value;
    },
    onSuccess: (_detail, { id }) => {
      invalidateAllPermissions(queryClient, undefined, id);
    },
  });
};

export const useDeletePermissionSet = (): UseMutationResult<void, Error, string> => {
  const { deletePermissionSet } = usePermissionsModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const result = await deletePermissionSet.execute(id);
      if (isErr(result)) throw result.error;
    },
    onSuccess: () => {
      invalidateAllPermissions(queryClient);
    },
  });
};

export const useSetTypeDefault = (): UseMutationResult<
  void,
  Error,
  SetTypeDefaultInput
> => {
  const { setTypeDefault } = usePermissionsModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SetTypeDefaultInput): Promise<void> => {
      const result = await setTypeDefault.execute(input);
      if (isErr(result)) throw result.error;
    },
    onSuccess: () => {
      invalidateAllPermissions(queryClient);
    },
  });
};

/** One user's effective permission tree plus their direct grants and denies. */
export const useUserPermissions = (
  userId: string,
): UseQueryResult<UserEffectivePermissions> => {
  const { getUserPermissions } = usePermissionsModule();
  return useQuery({
    queryKey: permissionKeys.user(userId),
    enabled: userId.length > 0,
    ...PERMISSION_QUERY_OPTIONS,
    queryFn: async (): Promise<UserEffectivePermissions> => {
      const result = await getUserPermissions.execute(userId);
      if (isErr(result)) throw result.error;
      return result.value;
    },
  });
};

export interface UpdateUserGrantsVars {
  readonly userId: string;
  readonly permissions: PermissionMap;
}

/** Add or remove a user's direct ("U") grants (send only the toggled keys). */
export const useUpdateUserGrants = (): UseMutationResult<
  PermissionUpdateResult,
  Error,
  UpdateUserGrantsVars
> => {
  const { updateUserGrants } = usePermissionsModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      permissions,
    }: UpdateUserGrantsVars): Promise<PermissionUpdateResult> => {
      const result = await updateUserGrants.execute(userId, permissions);
      if (isErr(result)) throw result.error;
      return result.value;
    },
    onSuccess: (_result, { userId }) => {
      invalidateAllPermissions(queryClient, userId);
    },
  });
};

export interface ReplaceUserDeniesVars {
  readonly userId: string;
  readonly deniedPermissions: readonly string[];
}

/** Replace a user's full deny set (an empty list clears every deny). */
export const useReplaceUserDenies = (): UseMutationResult<
  PermissionUpdateResult,
  Error,
  ReplaceUserDeniesVars
> => {
  const { replaceUserDenies } = usePermissionsModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      deniedPermissions,
    }: ReplaceUserDeniesVars): Promise<PermissionUpdateResult> => {
      const result = await replaceUserDenies.execute(userId, deniedPermissions);
      if (isErr(result)) throw result.error;
      return result.value;
    },
    onSuccess: (_result, { userId }) => {
      invalidateAllPermissions(queryClient, userId);
    },
  });
};
