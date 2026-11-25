import { type ReactElement } from 'react';
import { Download, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@shared/ui';
import styles from '@shared/ui/MediaViewer/MediaViewer.module.css';
import { useFileDownload } from '@shared/utils';
import { DocumentCategoryIcon } from './DocumentCategoryIcon';
import { type FileFormatInfo } from './resource-format-helper';

export interface DocumentViewerToolbarProps {
  readonly title: string;
  readonly formatInfo: FileFormatInfo;
  readonly resolvedUrl: string;
  readonly officeViewUrl: string;
  readonly index?: number | undefined;
  readonly total?: number | undefined;
}

export const DocumentViewerToolbar = ({
  title,
  formatInfo,
  resolvedUrl,
  officeViewUrl,
  index,
  total,
}: DocumentViewerToolbarProps): ReactElement => {
  const { isDownloading, download } = useFileDownload();
  const iconClass = [styles.iconBox, formatInfo.iconClass].filter(Boolean).join(' ');

  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault();
    void download(resolvedUrl, title);
  };

  const metaLabel =
    total && total > 1
      ? `${formatInfo.label} · File ${String((index ?? 0) + 1)} of ${String(total)}`
      : formatInfo.label;

  return (
    <div className={styles.toolbar}>
      <div className={styles.fileMeta}>
        <div className={iconClass}>
          <DocumentCategoryIcon category={formatInfo.category} size={18} />
        </div>
        <div className={styles.metaText}>
          <p className={styles.fileName}>{title}</p>
          <span className={styles.fileTypeBadge}>{metaLabel}</span>
        </div>
      </div>

      <div className={styles.actions}>
        {formatInfo.isOffice && (
          <Button asChild variant="outline" size="sm">
            <a
              href={officeViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in Office 365 Online Viewer"
            >
              <ExternalLink aria-hidden="true" />
              <span>Office 365</span>
            </a>
          </Button>
        )}

        <Button asChild variant="outline" size="sm">
          <a
            href={resolvedUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open file in a new tab"
          >
            <ExternalLink aria-hidden="true" />
            <span>Open in Tab</span>
          </a>
        </Button>

        <Button asChild variant="default" size="sm" disabled={isDownloading}>
          <a
            href={resolvedUrl}
            download={title}
            onClick={handleDownload}
            title="Download document directly"
          >
            {isDownloading ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Download aria-hidden="true" />
            )}
            <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
          </a>
        </Button>
      </div>
    </div>
  );
};
