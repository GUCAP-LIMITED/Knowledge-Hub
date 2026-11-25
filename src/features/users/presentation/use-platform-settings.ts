import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { useToast } from '@shared/ui';
import type { PlatformSettings } from '../domain';
import { useUsersModule } from './use-users-module';

export const platformSettingsKey = ['platform-settings'] as const;

export const usePlatformSettings = (): UseQueryResult<PlatformSettings> => {
  const { platformSettingsGateway } = useUsersModule();
  return useQuery({
    queryKey: platformSettingsKey,
    queryFn: () => platformSettingsGateway.getSettings(),
  });
};

export const useUpdatePlatformSettings = (): UseMutationResult<
  void,
  Error,
  PlatformSettings
> => {
  const { platformSettingsGateway } = useUsersModule();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (settings: PlatformSettings) =>
      platformSettingsGateway.updateSettings(settings),
    onSuccess: () => {
      toast.success('Platform settings updated successfully.');
      void queryClient.invalidateQueries({ queryKey: platformSettingsKey });
    },
    onError: () => {
      toast.error('Failed to update platform settings.');
    },
  });
};
