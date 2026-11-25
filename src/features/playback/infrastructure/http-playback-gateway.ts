import { type HttpClient } from '@core/http';
import { z } from 'zod';
import type { PlaybackGateway, PlaybackUrl } from '../domain';

const PlaybackUrlSchema = z.object({
  url: z.string(),
  expiresAt: z.string().nullable().optional(),
});

export class HttpPlaybackGateway implements PlaybackGateway {
  public constructor(private readonly http: HttpClient) {}

  public async getPlaybackUrl(mediaAssetId: string): Promise<PlaybackUrl> {
    const res = await this.http.get(`/api/app/playback/${mediaAssetId}`);
    const parsed = PlaybackUrlSchema.parse(res);
    return {
      url: parsed.url,
      expiresAt: parsed.expiresAt ?? null,
    };
  }
}
