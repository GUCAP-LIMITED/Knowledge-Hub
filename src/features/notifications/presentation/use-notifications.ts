import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { isErr } from '@core/result';
import type { Announcement } from '../domain';
import { useNotificationsModule } from './use-notifications-module';

export const announcementsQueryKey = ['notifications'] as const;

export const useAnnouncements = (): UseQueryResult<readonly Announcement[]> => {
  const { listAnnouncements } = useNotificationsModule();
  return useQuery({
    queryKey: announcementsQueryKey,
    queryFn: async (): Promise<readonly Announcement[]> => {
      const result = await listAnnouncements.execute();
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};

const useInvalidate = (): (() => void) => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: announcementsQueryKey });
  };
};

export const useMarkAnnouncementRead = (): UseMutationResult<
  Announcement,
  Error,
  string
> => {
  const { markAnnouncementRead } = useNotificationsModule();
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string): Promise<Announcement> => {
      const result = await markAnnouncementRead.execute(id);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: invalidate,
  });
};

export const useMarkAllRead = (): UseMutationResult<
  readonly Announcement[],
  Error,
  void
> => {
  const { markAllRead } = useNotificationsModule();
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (): Promise<readonly Announcement[]> => {
      const result = await markAllRead.execute();
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: invalidate,
  });
};
