import type { ReactElement } from 'react';
import { Paperclip } from 'lucide-react';
import styles from './ResourceCard.module.css';

export interface ResourceThumbProps {
  readonly icon: ReactElement;
  readonly thumbnailUrl?: string | null;
  readonly title?: string;
  readonly totalFiles: number;
}

/** Cover band for a resource card: real thumbnail or a format-tinted icon, plus an attachment-count overlay. */
export const ResourceThumb = ({
  icon,
  thumbnailUrl,
  title,
  totalFiles,
}: ResourceThumbProps): ReactElement => (
  <span className={styles.thumb}>
    {thumbnailUrl ? (
      <img src={thumbnailUrl} alt={title ?? ''} className={styles.thumbImg} />
    ) : (
      <span className={styles.thumbFallback}>
        <span className={styles.thumbFallbackIcon}>{icon}</span>
      </span>
    )}
    {totalFiles > 1 ? (
      <span className={styles.thumbFiles}>
        <Paperclip size={11} aria-hidden="true" />
        {totalFiles} files
      </span>
    ) : null}
  </span>
);
