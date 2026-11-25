import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { isErr } from '@core/result';
import type { PlaybackUrl } from '../domain';
import { usePlaybackModule } from './use-playback-module';

export const usePlaybackUrl = (
  mediaAssetId: string | null,
): UseQueryResult<PlaybackUrl> => {
  const { getPlaybackUrl } = usePlaybackModule();

  return useQuery({
    queryKey: ['playback', mediaAssetId] as const,
    queryFn: async (): Promise<PlaybackUrl> => {
      if (!mediaAssetId) {
        throw new Error('mediaAssetId is required');
      }
      const result = await getPlaybackUrl.execute(mediaAssetId);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    enabled: !!mediaAssetId,
    // Set stale time to 2 hours (Cloudflare tokens usually last 4 hours)
    staleTime: 1000 * 60 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};
