import type { ReactElement } from 'react';
import { Download, ExternalLink, FileText } from 'lucide-react';
import type { MediaAsset } from './media-asset';
import styles from './MediaViewer.module.css';

const Fallback = ({ asset }: { readonly asset: MediaAsset }): ReactElement => (
  <div className={styles.fallback}>
    <FileText size={40} aria-hidden="true" className={styles.fallbackIcon} />
    <p className={styles.fallbackText}>
      {asset.kind === 'doc'
        ? 'Word documents can’t be previewed inline — open or download to view.'
        : 'This resource opens in a new tab.'}
    </p>
    <a className={styles.download} href={asset.url} target="_blank" rel="noreferrer">
      {asset.kind === 'doc' ? (
        <>
          <Download size={15} aria-hidden="true" /> Download to view
        </>
      ) : (
        <>
          <ExternalLink size={15} aria-hidden="true" /> Open link
        </>
      )}
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
      return (
        <div className={styles.docWrap}>
          <iframe className={styles.frame} src={asset.url} title={asset.name} />
          <a
            className={styles.openLink}
            href={asset.url}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={13} aria-hidden="true" /> Open in a new tab
          </a>
        </div>
      );
    case 'doc':
    case 'link':
      return <Fallback asset={asset} />;
  }
};
