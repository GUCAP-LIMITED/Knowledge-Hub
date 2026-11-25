import { type ReactElement } from 'react';
import { Download, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@shared/ui';
import styles from '@shared/ui/MediaViewer/MediaViewer.module.css';
import { useFileDownload } from '@shared/utils';
import { DocumentCategoryIcon } from './DocumentCategoryIcon';
import { type FileFormatInfo } from './resource-format-helper';

export interface LegacyDocCardProps {
  readonly title: string;
  readonly formatInfo: FileFormatInfo;
  readonly resolvedUrl: string;
  readonly officeViewUrl: string;
}

export const LegacyDocCard = ({
  title,
  formatInfo,
  resolvedUrl,
  officeViewUrl,
}: LegacyDocCardProps): ReactElement => {
  const { isDownloading, download } = useFileDownload();
  const iconBoxClass = [styles.fallbackIconBox, formatInfo.iconClass]
    .filter(Boolean)
    .join(' ');

  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault();
    void download(resolvedUrl, title);
  };

  return (
    <div className={styles.fallbackCard}>
      <div className={iconBoxClass}>
        <DocumentCategoryIcon category={formatInfo.category} size={18} />
      </div>
      <h3 className={styles.fallbackTitle}>{title}</h3>
      <p className={styles.fallbackDesc}>
        This legacy {formatInfo.label} is ready for viewing in Office Online or
        downloading directly to your device.
      </p>
      <div className={styles.fallbackActions}>
        <Button asChild variant="outline" size="sm">
          <a href={officeViewUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink aria-hidden="true" />
            <span>View in Microsoft Office Online</span>
          </a>
        </Button>
        <Button asChild variant="default" size="sm" disabled={isDownloading}>
          <a href={resolvedUrl} download={title} onClick={handleDownload}>
            {isDownloading ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Download aria-hidden="true" />
            )}
            <span>{isDownloading ? 'Downloading...' : 'Download File'}</span>
          </a>
        </Button>
      </div>
    </div>
  );
};
