import type { ReactElement } from 'react';
import {
  Download,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  File as GenericFileIcon,
  Image as ImageIcon,
  Paperclip,
  Presentation,
  Video as VideoIcon,
} from 'lucide-react';
import type { ResourceAttachment } from '../domain';
import { Button } from '@shared/ui';
import { downloadFile } from '@shared/utils';
import { type DocumentCategory, getFormatInfo } from './resource-format-helper';
import styles from './ResourceAttachmentsList.module.css';

export interface ResourceAttachmentsListProps {
  readonly attachments?: readonly ResourceAttachment[] | undefined;
  readonly activeAttachmentId?: string | null | undefined;
  readonly onSelectAttachment?: ((id: string) => void) | undefined;
}

const renderAttachmentIcon = (category: DocumentCategory): ReactElement => {
  switch (category) {
    case 'pdf':
    case 'word':
      return <FileText size={16} aria-hidden="true" />;
    case 'excel':
      return <FileSpreadsheet size={16} aria-hidden="true" />;
    case 'powerpoint':
      return <Presentation size={16} aria-hidden="true" />;
    case 'image':
      return <ImageIcon size={16} aria-hidden="true" />;
    case 'video':
      return <VideoIcon size={16} aria-hidden="true" />;
    case 'text':
    case 'other':
      return <GenericFileIcon size={16} aria-hidden="true" />;
  }
};

const formatBytes = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${String(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface AttachmentActionsProps {
  readonly attachment: ResourceAttachment;
  readonly onSelectAttachment?: ((id: string) => void) | undefined;
}

const AttachmentActions = ({
  attachment,
  onSelectAttachment,
}: AttachmentActionsProps): ReactElement => (
  <div className={styles.attachmentActions}>
    {onSelectAttachment && (
      <Button
        variant="outline"
        size="icon-xs"
        onClick={() => {
          onSelectAttachment(attachment.id);
        }}
        title="Preview in Viewer"
        aria-label={`Preview ${attachment.name}`}
      >
        <Eye aria-hidden="true" />
      </Button>
    )}
    {attachment.url && (
      <>
        <Button asChild variant="outline" size="icon-xs">
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new tab"
            aria-label={`Open ${attachment.name} in new tab`}
          >
            <ExternalLink aria-hidden="true" />
          </a>
        </Button>
        <Button asChild variant="outline" size="icon-xs">
          <a
            href={attachment.url}
            download={attachment.name}
            onClick={(e) => {
              e.preventDefault();
              if (attachment.url) {
                void downloadFile(attachment.url, attachment.name);
              }
            }}
            title="Download file"
            aria-label={`Download ${attachment.name}`}
          >
            <Download aria-hidden="true" />
          </a>
        </Button>
      </>
    )}
  </div>
);

interface AttachmentCardProps {
  readonly attachment: ResourceAttachment;
  readonly isActive: boolean;
  readonly onSelectAttachment?: ((id: string) => void) | undefined;
}

const AttachmentCard = ({
  attachment,
  isActive,
  onSelectAttachment,
}: AttachmentCardProps): ReactElement => {
  const format = getFormatInfo(attachment.url ?? '', attachment.name);
  const sizeLabel = formatBytes(attachment.sizeBytes);

  return (
    <div
      className={[styles.attachmentCard, isActive ? styles.attachmentCardActive : '']
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className={styles.attachmentContent}
        onClick={() => {
          onSelectAttachment?.(attachment.id);
        }}
        title={`Preview ${attachment.name}`}
      >
        <div className={[styles.iconTile, format.iconClass].filter(Boolean).join(' ')}>
          {renderAttachmentIcon(format.category)}
        </div>
        <div className={styles.attachmentInfo}>
          <span className={styles.attachmentName} title={attachment.name}>
            {attachment.name}
          </span>
          <span className={styles.attachmentMeta}>
            {format.label}
            {sizeLabel ? ` · ${sizeLabel}` : ''}
          </span>
        </div>
      </button>

      <AttachmentActions
        attachment={attachment}
        onSelectAttachment={onSelectAttachment}
      />
    </div>
  );
};

export const ResourceAttachmentsList = ({
  attachments,
  activeAttachmentId,
  onSelectAttachment,
}: ResourceAttachmentsListProps): ReactElement | null => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <section className={styles.attachmentsSection} aria-label="Attached Resources">
      <div className={styles.attachmentsHeader}>
        <div className={styles.headerTitleWrapper}>
          <Paperclip size={16} className={styles.headerIcon} aria-hidden="true" />
          <h3 className={styles.headerTitle}>Additional Attachments</h3>
          <span className={styles.attachmentsBadge}>{attachments.length}</span>
        </div>
      </div>

      <div className={styles.attachmentsGrid}>
        {attachments.map((att) => (
          <AttachmentCard
            key={att.id}
            attachment={att}
            isActive={att.id === activeAttachmentId}
            onSelectAttachment={onSelectAttachment}
          />
        ))}
      </div>
    </section>
  );
};
