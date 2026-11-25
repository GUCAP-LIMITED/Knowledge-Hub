export interface PlaybackUrl {
  readonly url: string;
  readonly expiresAt: string | null;
}

export interface PlaybackGateway {
  getPlaybackUrl(mediaAssetId: string): Promise<PlaybackUrl>;
}
