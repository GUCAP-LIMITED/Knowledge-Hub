import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { isErr } from '@core/result';
import type { TeamMember } from '../domain';
import { useTeamModule } from './use-team-module';

/** Stable query key for the team roster. */
export const teamQueryKey = ['team'] as const;

/** List query. Unwraps the domain `Result`, throwing the `AppError` so Query surfaces it. */
export const useTeamMembers = (): UseQueryResult<readonly TeamMember[]> => {
  const { listTeamMembers } = useTeamModule();

  return useQuery({
    queryKey: teamQueryKey,
    queryFn: async (): Promise<readonly TeamMember[]> => {
      const result = await listTeamMembers.execute();
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};
