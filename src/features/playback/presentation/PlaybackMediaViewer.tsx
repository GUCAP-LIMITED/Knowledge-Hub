import type { ReactElement } from 'react';
import { usePlaybackUrl } from './use-playback';
import { MediaViewer } from '@shared/ui/MediaViewer/MediaViewer';
import type { MediaKind } from '@shared/ui/MediaViewer/media-asset';
import { Skeleton } from '@shared/ui';
import { AlertCircle } from 'lucide-react';
import styles from '@shared/ui/MediaViewer/MediaViewer.module.css';

export interface PlaybackMediaViewerProps {
  readonly mediaAssetId: string | null;
  readonly externalUrl?: string | null | undefined;
  readonly kind: MediaKind;
  readonly title: string;
  readonly autoPlay?: boolean | undefined;
  readonly onEnded?: (() => void) | undefined;
  readonly onPlayingChange?: ((isPlaying: boolean) => void) | undefined;
}

const isImageDocument = (urlOrTitle?: string | null): boolean => {
  if (!urlOrTitle) return false;
  const clean = urlOrTitle.split('?')[0] ?? '';
  const ext = clean.slice(clean.lastIndexOf('.')).toLowerCase();
  return ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext);
};

const isOfficeDocument = (urlOrTitle?: string | null): boolean => {
  if (!urlOrTitle) return false;
  const clean = urlOrTitle.split('?')[0] ?? '';
  const ext = clean.slice(clean.lastIndexOf('.')).toLowerCase();
  return ['.doc', '.docx', '.ppt', '.pptx'].includes(ext);
};

export const PlaybackMediaViewer = ({
  mediaAssetId,
  externalUrl,
  kind,
  title,
  autoPlay,
  onEnded,
  onPlayingChange,
}: PlaybackMediaViewerProps): ReactElement => {
  const { data, isLoading, isError, error } = usePlaybackUrl(mediaAssetId);

  const resolveKind = (targetUrl: string | null): MediaKind => {
    if (isImageDocument(targetUrl) || isImageDocument(title)) {
      return 'image';
    }
    if (isOfficeDocument(targetUrl) || isOfficeDocument(title)) {
      return 'doc';
    }
    return kind;
  };

  if (!mediaAssetId && externalUrl) {
    return (
      <MediaViewer
        asset={{
          kind: resolveKind(externalUrl),
          name: title,
          url: externalUrl,
        }}
        autoPlay={autoPlay}
        onEnded={onEnded}
        onPlayingChange={onPlayingChange}
      />
    );
  }

  if (!mediaAssetId) {
    return <MediaViewer asset={null} />;
  }

  if (isLoading) {
    return <Skeleton width="100%" height={400} radius={12} />;
  }

  const resolvedUrl = data?.url ?? externalUrl ?? null;

  if (isError || !resolvedUrl) {
    const msg = error?.message ?? 'Video stream is currently unavailable.';

    return (
      <div className={styles.fallback}>
        <AlertCircle size={40} className="text-destructive mb-4" />
        <p className={styles.fallbackText}>{msg}</p>
      </div>
    );
  }

  // Pass the resolved URL down as an uploaded asset
  return (
    <MediaViewer
      asset={{
        kind: resolveKind(resolvedUrl),
        name: title,
        url: resolvedUrl,
      }}
      autoPlay={autoPlay}
      onEnded={onEnded}
      onPlayingChange={onPlayingChange}
    />
  );
};
