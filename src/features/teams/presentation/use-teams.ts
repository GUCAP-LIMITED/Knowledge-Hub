import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { useToast } from '@shared/ui';
import type {
  CreateTeamInput,
  SelectableUserType,
  Team,
  UpdateTeamInput,
} from '../domain';
import { useTeamsModule } from './use-teams-module';

/** Stable query key for the teams list. Mutations invalidate this so the list re-fetches. */
export const teamsQueryKey = ['teams'] as const;
export const selectableUserTypesQueryKey = ['teams', 'selectable-user-types'] as const;

export const useTeams = (): UseQueryResult<readonly Team[]> => {
  const { gateway } = useTeamsModule();
  return useQuery({ queryKey: teamsQueryKey, queryFn: () => gateway.list() });
};

export const useSelectableUserTypes = (): UseQueryResult<
  readonly SelectableUserType[]
> => {
  const { gateway } = useTeamsModule();
  return useQuery({
    queryKey: selectableUserTypesQueryKey,
    queryFn: () => gateway.selectableUserTypes(),
  });
};

export const useCreateTeam = (): UseMutationResult<Team, Error, CreateTeamInput> => {
  const { gateway } = useTeamsModule();
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (input: CreateTeamInput) => gateway.create(input),
    onSuccess: () => {
      toast.success('Team created.');
      void queryClient.invalidateQueries({ queryKey: teamsQueryKey });
    },
  });
};

export interface UpdateTeamVars {
  readonly id: string;
  readonly input: UpdateTeamInput;
}

export const useUpdateTeam = (): UseMutationResult<Team, Error, UpdateTeamVars> => {
  const { gateway } = useTeamsModule();
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, input }: UpdateTeamVars) => gateway.update(id, input),
    onSuccess: () => {
      toast.success('Team updated.');
      void queryClient.invalidateQueries({ queryKey: teamsQueryKey });
    },
  });
};

export const useDeleteTeam = (): UseMutationResult<void, Error, string> => {
  const { gateway } = useTeamsModule();
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => gateway.remove(id),
    onSuccess: () => {
      toast.success('Team deleted.');
      void queryClient.invalidateQueries({ queryKey: teamsQueryKey });
    },
  });
};
