import { type Result, ok, err } from '@core/result';
import { AppError, UnexpectedError } from '@core/errors/app-error';
import type { PlaybackGateway, PlaybackUrl } from '../../domain';

export class GetPlaybackUrlUseCase {
  public constructor(private readonly gateway: PlaybackGateway) {}

  public async execute(mediaAssetId: string): Promise<Result<PlaybackUrl>> {
    try {
      const url = await this.gateway.getPlaybackUrl(mediaAssetId);
      return ok(url);
    } catch (error) {
      return err(error instanceof AppError ? error : UnexpectedError.from(error));
    }
  }
}
