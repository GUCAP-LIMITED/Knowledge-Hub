import type { HttpClient } from '@core/http';
import { GetPlaybackUrlUseCase } from './application';
import { HttpPlaybackGateway } from './infrastructure';

export interface PlaybackModuleDeps {
  readonly httpClient: HttpClient;
}

export interface PlaybackModule {
  readonly getPlaybackUrl: GetPlaybackUrlUseCase;
}

export const createPlaybackModule = (deps: PlaybackModuleDeps): PlaybackModule => {
  const playbackGateway = new HttpPlaybackGateway(deps.httpClient);
  return {
    getPlaybackUrl: new GetPlaybackUrlUseCase(playbackGateway),
  };
};
