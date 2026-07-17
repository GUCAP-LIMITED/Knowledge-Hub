import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { isErr } from '@core/result';
import type {
  CreateUserTypeInput,
  SelectableUserType,
  UpdateUserTypeInput,
  UserType,
} from '../domain';
import { useUserTypesModule } from './use-user-types-module';

/** Stable query key for the user-types list. Mutations invalidate this so the list re-fetches. */
export const userTypesQueryKey = ['user-types'] as const;
export const selectableUserTypesQueryKey = (assignableOnly: boolean) =>
  ['user-types', 'selectable', assignableOnly] as const;

export const useUserTypes = (): UseQueryResult<readonly UserType[]> => {
  const { listUserTypes } = useUserTypesModule();
  return useQuery({
    queryKey: userTypesQueryKey,
    queryFn: async (): Promise<readonly UserType[]> => {
      const result = await listUserTypes.execute();
      if (isErr(result)) throw result.error;
      return result.value;
    },
  });
};

export const useSelectableUserTypes = (
  assignableOnly: boolean,
): UseQueryResult<readonly SelectableUserType[]> => {
  const { listSelectableUserTypes } = useUserTypesModule();
  return useQuery({
    queryKey: selectableUserTypesQueryKey(assignableOnly),
    queryFn: async (): Promise<readonly SelectableUserType[]> => {
      const result = await listSelectableUserTypes.execute(assignableOnly);
      if (isErr(result)) throw result.error;
      return result.value;
    },
  });
};

export const useCreateUserType = (): UseMutationResult<
  UserType,
  Error,
  CreateUserTypeInput
> => {
  const { createUserType } = useUserTypesModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateUserTypeInput): Promise<UserType> => {
      const result = await createUserType.execute(input);
      if (isErr(result)) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userTypesQueryKey });
    },
  });
};

export interface UpdateUserTypeVars {
  readonly id: string;
  readonly input: UpdateUserTypeInput;
}

export const useUpdateUserType = (): UseMutationResult<
  UserType,
  Error,
  UpdateUserTypeVars
> => {
  const { updateUserType } = useUserTypesModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: UpdateUserTypeVars): Promise<UserType> => {
      const result = await updateUserType.execute(id, input);
      if (isErr(result)) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userTypesQueryKey });
    },
  });
};

export interface ReorderUserTypeVars {
  readonly id: string;
  readonly hierarchyLevel: number;
}

export const useReorderUserType = (): UseMutationResult<
  UserType,
  Error,
  ReorderUserTypeVars
> => {
  const { reorderUserType } = useUserTypesModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      hierarchyLevel,
    }: ReorderUserTypeVars): Promise<UserType> => {
      const result = await reorderUserType.execute(id, hierarchyLevel);
      if (isErr(result)) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userTypesQueryKey });
    },
  });
};

export const useDeleteUserType = (): UseMutationResult<void, Error, string> => {
  const { deleteUserType } = useUserTypesModule();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const result = await deleteUserType.execute(id);
      if (isErr(result)) throw result.error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userTypesQueryKey });
    },
  });
};
