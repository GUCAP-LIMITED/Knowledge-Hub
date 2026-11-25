/* eslint-disable complexity */
import { type ReactElement, useMemo } from 'react';
import {
  AlertCircle,
  Download,
  ExternalLink,
  Loader2,
  FileText,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  Video as VideoIcon,
  File as GenericFileIcon,
} from 'lucide-react';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import { Button, Skeleton, VideoPlayer } from '@shared/ui';
import { useFileDownload } from '@shared/utils';
import type { Resource } from '../domain';
import { usePlaybackUrl } from '@features/playback';
import {
  type DocumentCategory,
  type FileFormatInfo,
  getFormatInfo,
} from './resource-format-helper';
import { LegacyDocCard } from './LegacyDocCard';
import {
  DOCUMENT_VIEWER_BACKGROUND,
  DOCUMENT_VIEWER_THEME,
} from './document-viewer-theme';
import { ResourceAttachmentsList } from './ResourceAttachmentsList';
import styles from '@shared/ui/MediaViewer/MediaViewer.module.css';

export interface ResourceViewerProps {
  readonly resource: Resource;
}

const renderIcon = (category: DocumentCategory): ReactElement => {
  switch (category) {
    case 'pdf':
    case 'word':
      return <FileText size={18} aria-hidden="true" />;
    case 'excel':
      return <FileSpreadsheet size={18} aria-hidden="true" />;
    case 'powerpoint':
      return <Presentation size={18} aria-hidden="true" />;
    case 'image':
      return <ImageIcon size={18} aria-hidden="true" />;
    case 'video':
      return <VideoIcon size={18} aria-hidden="true" />;
    case 'text':
    case 'other':
      return <GenericFileIcon size={18} aria-hidden="true" />;
  }
};

const ViewerToolbar = ({
  title,
  formatInfo,
  resolvedUrl,
  officeViewUrl,
}: {
  readonly title: string;
  readonly formatInfo: FileFormatInfo;
  readonly resolvedUrl: string;
  readonly officeViewUrl: string;
}): ReactElement => {
  const { isDownloading, download } = useFileDownload();
  const iconClass = [styles.iconBox, formatInfo.iconClass].filter(Boolean).join(' ');

  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault();
    void download(resolvedUrl, title);
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.fileMeta}>
        <div className={iconClass}>{renderIcon(formatInfo.category)}</div>
        <div className={styles.metaText}>
          <p className={styles.fileName}>{title}</p>
          <span className={styles.fileTypeBadge}>{formatInfo.label}</span>
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

const ViewerContent = ({
  title,
  formatInfo,
  resolvedUrl,
  officeViewUrl,
}: {
  readonly title: string;
  readonly formatInfo: FileFormatInfo;
  readonly resolvedUrl: string;
  readonly officeViewUrl: string;
}): ReactElement => {
  if (formatInfo.category === 'image') {
    return <img src={resolvedUrl} alt={title} className={styles.image} />;
  }

  if (formatInfo.category === 'video') {
    return <VideoPlayer src={resolvedUrl} title={title} />;
  }

  const isLegacy = ['doc', 'ppt', 'xls'].includes(formatInfo.extension);
  if (isLegacy) {
    return (
      <LegacyDocCard
        title={title}
        formatInfo={formatInfo}
        resolvedUrl={resolvedUrl}
        officeViewUrl={officeViewUrl}
      />
    );
  }

  return (
    <div className={styles.docViewerWrapper}>
      <DocViewer
        documents={[
          {
            uri: resolvedUrl,
            fileName: title,
            ...(formatInfo.extension ? { fileType: formatInfo.extension } : {}),
          },
        ]}
        pluginRenderers={DocViewerRenderers}
        config={{
          header: {
            disableHeader: true,
            disableFileName: true,
            retainURLParams: false,
          },
          pdfZoom: {
            defaultZoom: 1,
            zoomJump: 0.2,
          },
          pdfVerticalScrollByDefault: true,
        }}
        theme={DOCUMENT_VIEWER_THEME}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: DOCUMENT_VIEWER_BACKGROUND,
        }}
      />
    </div>
  );
};

export const ResourceViewer = ({ resource }: ResourceViewerProps): ReactElement => {
  const isDirectUrl = Boolean(
    resource.mediaUrl &&
    (resource.mediaUrl.startsWith('http://') ||
      resource.mediaUrl.startsWith('https://') ||
      resource.mediaUrl.startsWith('blob:')),
  );

  const { data, isLoading, isError, error } = usePlaybackUrl(
    !isDirectUrl && resource.mediaUrl ? resource.mediaUrl : null,
  );

  const resolvedUrl = isDirectUrl ? (resource.mediaUrl ?? '') : (data?.url ?? '');
  const formatInfo = useMemo(
    () => (resolvedUrl ? getFormatInfo(resolvedUrl, resource.title) : null),
    [resolvedUrl, resource.title],
  );

  if (!resource.mediaUrl) {
    return (
      <div className={styles.fallback}>
        <AlertCircle
          size={40}
          style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}
        />
        <p className={styles.fallbackText}>No document or media available.</p>
      </div>
    );
  }

  if (!isDirectUrl && isLoading) {
    return <Skeleton width="100%" height={480} radius={12} />;
  }

  if ((!isDirectUrl && isError) || !resolvedUrl || !formatInfo) {
    return (
      <div className={styles.fallback}>
        <AlertCircle size={40} className="text-destructive mb-4" />
        <p className={styles.fallbackText}>
          {error?.message ?? 'Failed to load resource document'}
        </p>
      </div>
    );
  }

  const officeViewUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
    resolvedUrl,
  )}`;

  return (
    <div className={styles.viewerWrapper}>
      <ViewerToolbar
        title={resource.title}
        formatInfo={formatInfo}
        resolvedUrl={resolvedUrl}
        officeViewUrl={officeViewUrl}
      />
      <div className={styles.docContainer}>
        <ViewerContent
          title={resource.title}
          formatInfo={formatInfo}
          resolvedUrl={resolvedUrl}
          officeViewUrl={officeViewUrl}
        />
      </div>

      <ResourceAttachmentsList attachments={resource.attachments} />
    </div>
  );
};
