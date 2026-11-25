import type { ReactElement } from 'react';
import { Download, Edit2, Eye, Layers } from 'lucide-react';
import { Button, IconButton, Tooltip } from '@shared/ui';
import { cn, downloadFile } from '@shared/utils';
import type { Resource, ResourceAttachment } from '@features/resources';
import { getFormatInfo } from '@features/resources/presentation/resource-format-helper';
import { DocumentCategoryIcon } from '@features/resources/presentation/DocumentCategoryIcon';
import styles from './ResourceDetailPage.module.css';

const formatBytes = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${String(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export interface AttachedFilesListProps {
  readonly resource: Resource;
  readonly onSelectDocument: (id: string) => void;
  readonly activeDocId?: string | null | undefined;
  readonly canEdit?: boolean;
  readonly onEdit?: () => void;
}

const PrimaryFileCard = ({
  resource,
  isActive,
  onSelectDocument,
}: {
  readonly resource: Resource;
  readonly isActive: boolean;
  readonly onSelectDocument: (id: string) => void;
}): ReactElement | null => {
  if (!resource.mediaUrl) return null;
  const displayName = resource.primaryMediaName
    ? resource.primaryMediaName
    : resource.title;
  const primaryFormat = getFormatInfo(resource.mediaUrl, displayName);
  const primarySize = formatBytes(resource.primaryMediaSizeBytes);

  return (
    <article className={cn(styles.fileCard, isActive && styles.fileCardActive)}>
      <button
        type="button"
        className={styles.fileCardMain}
        onClick={() => {
          onSelectDocument('primary');
        }}
        title={`Preview ${displayName}`}
      >
        <div className={styles.fileCardIcon}>
          <DocumentCategoryIcon category={primaryFormat.category} size={18} />
        </div>
        <div className={styles.fileCardDetails}>
          <span className={styles.fileCardName}>{displayName}</span>
          <div className={styles.fileCardMeta}>
            <span className={cn(styles.fileCardTag, styles.fileCardTagPrimary)}>
              Primary File
            </span>
            <span>{primaryFormat.label}</span>
            {primarySize ? <span>• {primarySize}</span> : null}
          </div>
        </div>
      </button>

      <div className={styles.fileCardActions}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            onSelectDocument('primary');
          }}
        >
          <Eye aria-hidden="true" /> Preview
        </Button>
        <Button asChild variant="outline" size="icon-sm">
          <a
            href={resource.mediaUrl}
            download={displayName}
            onClick={(e) => {
              e.preventDefault();
              if (resource.mediaUrl) {
                void downloadFile(resource.mediaUrl, displayName);
              }
            }}
            title="Download file"
            aria-label={`Download ${displayName}`}
          >
            <Download aria-hidden="true" />
          </a>
        </Button>
      </div>
    </article>
  );
};

const AttachmentItemCard = ({
  att,
  isActive,
  onSelectDocument,
}: {
  readonly att: ResourceAttachment;
  readonly isActive: boolean;
  readonly onSelectDocument: (id: string) => void;
}): ReactElement => {
  const attFormat = getFormatInfo(att.url ?? '', att.name);
  const attSize = formatBytes(att.sizeBytes);

  return (
    <article className={cn(styles.fileCard, isActive && styles.fileCardActive)}>
      <button
        type="button"
        className={styles.fileCardMain}
        onClick={() => {
          onSelectDocument(att.id);
        }}
        title={`Preview ${att.name}`}
      >
        <div className={styles.fileCardIcon}>
          <DocumentCategoryIcon category={attFormat.category} size={18} />
        </div>
        <div className={styles.fileCardDetails}>
          <span className={styles.fileCardName}>{att.name}</span>
          <div className={styles.fileCardMeta}>
            <span className={styles.fileCardTag}>Attachment</span>
            <span>{attFormat.label}</span>
            {attSize ? <span>• {attSize}</span> : null}
          </div>
        </div>
      </button>

      <div className={styles.fileCardActions}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            onSelectDocument(att.id);
          }}
        >
          <Eye aria-hidden="true" /> Preview
        </Button>
        {att.url ? (
          <Button asChild variant="outline" size="icon-sm">
            <a
              href={att.url}
              download={att.name}
              onClick={(e) => {
                e.preventDefault();
                void downloadFile(att.url ?? '', att.name);
              }}
              title="Download file"
              aria-label={`Download ${att.name}`}
            >
              <Download aria-hidden="true" />
            </a>
          </Button>
        ) : null}
      </div>
    </article>
  );
};

export const AttachedFilesList = ({
  resource,
  onSelectDocument,
  activeDocId,
  canEdit,
  onEdit,
}: AttachedFilesListProps): ReactElement => {
  return (
    <section className={styles.card} aria-labelledby="documents-heading">
      <div className={styles.cardHead}>
        <h2 id="documents-heading" className={styles.cardTitle}>
          <Layers size={18} aria-hidden="true" /> Documents & Files
        </h2>
        <div className={styles.cardHeadActions}>
          <span className={styles.cardBadge}>
            {(resource.mediaUrl ? 1 : 0) + resource.attachments.length} items
          </span>
          {canEdit && onEdit && (
            <Tooltip label="Edit resource files">
              <IconButton label="Edit resource files" onClick={onEdit}>
                <Edit2 size={14} aria-hidden="true" />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </div>

      <div className={styles.filesList}>
        <PrimaryFileCard
          resource={resource}
          isActive={activeDocId === 'primary'}
          onSelectDocument={onSelectDocument}
        />

        {resource.attachments.map((att) => (
          <AttachmentItemCard
            key={att.id}
            att={att}
            isActive={activeDocId === att.id}
            onSelectDocument={onSelectDocument}
          />
        ))}

        {!resource.mediaUrl && resource.attachments.length === 0 ? (
          <p className={styles.descriptionText}>
            No document or attachment uploaded for this resource.
          </p>
        ) : null}
      </div>
    </section>
  );
};
