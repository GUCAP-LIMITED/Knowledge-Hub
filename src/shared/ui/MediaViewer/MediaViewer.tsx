import type { ReactElement } from 'react';
import { ExternalLink, FileText } from 'lucide-react';
import type { MediaAsset } from './media-asset';
import styles from './MediaViewer.module.css';

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
}): ReactElement => (
  <div className={styles.docWrap}>
    <iframe className={styles.frame} src={src} title={name} />
    <a className={styles.openLink} href={url} target="_blank" rel="noreferrer">
      <ExternalLink size={13} aria-hidden="true" /> Open in a new tab
    </a>
  </div>
);

const LinkFallback = ({ asset }: { readonly asset: MediaAsset }): ReactElement => (
  <div className={styles.fallback}>
    <FileText size={40} aria-hidden="true" className={styles.fallbackIcon} />
    <p className={styles.fallbackText}>This resource opens in a new tab.</p>
    <a className={styles.download} href={asset.url} target="_blank" rel="noreferrer">
      <ExternalLink size={15} aria-hidden="true" /> Open link
    </a>
  </div>
);

/** Renders the right in-browser player/preview for a media asset, with sensible fallbacks. */
export const MediaViewer = ({ asset }: { readonly asset: MediaAsset }): ReactElement => {
  switch (asset.kind) {
    case 'video':
      return (
        <video className={styles.video} src={asset.url} controls preload="metadata">
          <track kind="captions" />
        </video>
      );
    case 'image':
      return <img className={styles.image} src={asset.url} alt={asset.name} />;
    case 'pdf':
      return <FramePreview src={asset.url} name={asset.name} url={asset.url} />;
    case 'doc':
      return (
        <FramePreview src={officeEmbedUrl(asset.url)} name={asset.name} url={asset.url} />
      );
    case 'link':
      return <LinkFallback asset={asset} />;
  }
};
