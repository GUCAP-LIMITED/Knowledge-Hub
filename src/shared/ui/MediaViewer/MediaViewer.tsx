import { lazy, Suspense, type ReactElement } from 'react';
import { ExternalLink, FileText, AlertCircle, Maximize, Minimize } from 'lucide-react';
import { useFullscreen } from '@shared/utils';
import { VideoPlayer } from '../VideoPlayer/VideoPlayer';
import { Button } from '../Button/Button';
import { Spinner } from '../Spinner/Spinner';
import type { MediaAsset } from './media-asset';
import styles from './MediaViewer.module.css';

// Lazy-loaded: react-pdf/pdfjs-dist touches browser-only APIs (e.g. DOMMatrix) at import time,
// which breaks unrelated component tests that merely import the @shared/ui barrel.
const PdfViewer = lazy(async () => ({
  default: (await import('../PdfViewer/PdfViewer')).PdfViewer,
}));

const WordDocViewer = lazy(async () => ({
  default: (await import('../WordDocViewer/WordDocViewer')).WordDocViewer,
}));

/**
 * Office Online can render Word/PowerPoint/Excel inline in an iframe from a public URL — the same
 * trick lets docs preview in the browser instead of forcing a download.
 */
const officeEmbedUrl = (url: string): string =>
  `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;

const FramePreview = ({
  src,
  name,
  url,
}: {
  readonly src: string;
  readonly name: string;
  readonly url: string;
}): ReactElement => {
  const { ref, isFullscreen, toggleFullscreen } = useFullscreen<HTMLDivElement>();

  return (
    <div ref={ref} className={styles.docWrap}>
      <iframe className={styles.frame} src={src} title={name} />
      <div className={styles.docWrapActions}>
        <Button asChild variant="link" size="sm">
          <a href={url} target="_blank" rel="noreferrer">
            <ExternalLink aria-hidden="true" /> Open in a new tab
          </a>
        </Button>
        <Button
          variant="ghost"
          size="xs"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize aria-hidden="true" />
          ) : (
            <Maximize aria-hidden="true" />
          )}
          {isFullscreen ? 'Exit fullscreen' : 'Full screen'}
        </Button>
      </div>
    </div>
  );
};

const LinkFallback = ({ asset }: { readonly asset: MediaAsset }): ReactElement => (
  <div className={styles.fallback}>
    <FileText size={40} aria-hidden="true" className={styles.fallbackIcon} />
    <p className={styles.fallbackText}>This resource opens in a new tab.</p>
    <Button asChild size="sm">
      <a href={asset.url} target="_blank" rel="noreferrer">
        <ExternalLink aria-hidden="true" /> Open link
      </a>
    </Button>
  </div>
);

const OfficeDocPreview = ({ asset }: { readonly asset: MediaAsset }): ReactElement => {
  const isDocx =
    asset.name.toLowerCase().endsWith('.docx') ||
    (asset.url.toLowerCase().split('?')[0]?.endsWith('.docx') ?? false);

  if (isDocx) {
    return (
      <Suspense fallback={<Spinner size="lg" />}>
        <WordDocViewer url={asset.url} title={asset.name} />
      </Suspense>
    );
  }

  if (asset.url.startsWith('blob:')) {
    return (
      <div className={styles.fallbackCard}>
        <div
          className={styles.iconBox}
          style={{ background: 'linear-gradient(135deg, #c43e1c, #942b13)' }}
        >
          <FileText size={20} />
        </div>
        <h4 className={styles.fallbackTitle}>{asset.name}</h4>
        <p className={styles.fallbackDesc}>
          Office document is staged. In-browser preview will be active once saved.
        </p>
      </div>
    );
  }

  return (
    <FramePreview src={officeEmbedUrl(asset.url)} name={asset.name} url={asset.url} />
  );
};

export interface MediaViewerProps {
  readonly asset: MediaAsset | null;
  readonly autoPlay?: boolean | undefined;
  readonly onEnded?: (() => void) | undefined;
  readonly onPlayingChange?: ((isPlaying: boolean) => void) | undefined;
}

/** Renders the right in-browser player/preview for a media asset, with sensible fallbacks. */
export const MediaViewer = ({
  asset,
  autoPlay,
  onEnded,
  onPlayingChange,
}: MediaViewerProps): ReactElement => {
  if (!asset) {
    return (
      <div className={styles.fallback}>
        <AlertCircle size={40} className={styles.fallbackIcon} />
        <p className={styles.fallbackText}>No media asset available.</p>
      </div>
    );
  }

  switch (asset.kind) {
    case 'video': {
      return (
        <VideoPlayer
          src={asset.url}
          title={asset.name}
          autoPlay={autoPlay}
          onEnded={onEnded}
          onPlayingChange={onPlayingChange}
        />
      );
    }
    case 'image':
      return <img className={styles.image} src={asset.url} alt={asset.name} />;
    case 'pdf':
      return (
        <Suspense fallback={<Spinner size="lg" />}>
          <PdfViewer url={asset.url} title={asset.name} />
        </Suspense>
      );
    case 'doc':
      return <OfficeDocPreview asset={asset} />;
    case 'link':
      return <LinkFallback asset={asset} />;
  }
};
