import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  FileSpreadsheet,
  FileText,
  File as GenericFileIcon,
  Image as ImageIcon,
  Presentation,
  ThumbsUp,
  Video as VideoIcon,
} from 'lucide-react';
import { Badge, CategoryBadge, RatingStars, StatusBadge } from '@shared/ui';
import { cn, sanitizeRichText, useHoverPreview } from '@shared/utils';
import type { Resource } from '../domain';
import { type DocumentCategory, getFormatInfo } from './resource-format-helper';
import { ResourceCardActions } from './ResourceCardActions';
import { ResourceCardPreview } from './ResourceCardPreview';
import { ResourceThumb } from './ResourceThumb';
import styles from './ResourceCard.module.css';

export interface ResourceCardProps {
  readonly resource: Resource;
  readonly isBusy: boolean;
  readonly onEdit: (resource: Resource) => void;
  readonly onDelete: (id: string) => void;
}

const renderFormatIcon = (category: DocumentCategory, size: number): ReactElement => {
  switch (category) {
    case 'pdf':
    case 'word':
      return <FileText size={size} aria-hidden="true" />;
    case 'excel':
      return <FileSpreadsheet size={size} aria-hidden="true" />;
    case 'powerpoint':
      return <Presentation size={size} aria-hidden="true" />;
    case 'image':
      return <ImageIcon size={size} aria-hidden="true" />;
    case 'video':
      return <VideoIcon size={size} aria-hidden="true" />;
    case 'text':
    case 'other':
      return <GenericFileIcon size={size} aria-hidden="true" />;
  }
};

const formatBadgeClass = (category: DocumentCategory): string | undefined => {
  switch (category) {
    case 'pdf':
      return styles.formatBadgePdf;
    case 'word':
      return styles.formatBadgeWord;
    case 'excel':
      return styles.formatBadgeExcel;
    case 'powerpoint':
      return styles.formatBadgePpt;
    case 'video':
      return styles.formatBadgeVideo;
    case 'image':
    case 'text':
    case 'other':
      return undefined;
  }
};

const relativeDateLabel = (date: Date): string => {
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return 'Updated today';
  if (days === 1) return 'Updated yesterday';
  if (days < 7) return `Updated ${String(days)}d ago`;
  if (days < 30) return `Updated ${String(Math.floor(days / 7))}w ago`;
  return `Updated ${date.toLocaleDateString('en-GB')}`;
};

const VisibilityTag = ({
  visibility,
}: {
  readonly visibility: string;
}): ReactElement | null => {
  if (visibility === 'Team') {
    return (
      <Badge size="sm" tone="info">
        Team
      </Badge>
    );
  }
  if (visibility === 'Private') {
    return (
      <Badge size="sm" tone="warning">
        Private
      </Badge>
    );
  }
  return null;
};

const resolveDisplayFileName = (resource: Resource): string => {
  if (resource.primaryMediaName) return resource.primaryMediaName;
  if (resource.attachments.length > 0 && resource.attachments[0]?.name) {
    return resource.attachments[0].name;
  }
  return 'Document';
};

const ResourceCardMain = ({
  resource,
}: {
  readonly resource: Resource;
}): ReactElement => {
  const primaryUrl = resource.mediaUrl ?? '';
  const displayTitle = resource.primaryMediaName || resource.title;
  const formatInfo = getFormatInfo(primaryUrl, displayTitle);
  const totalFiles = (resource.mediaUrl ? 1 : 0) + resource.attachments.length;
  const fileName = resolveDisplayFileName(resource);

  return (
    <Link
      to={`/resources/${resource.slug || resource.id}`}
      className={styles.cardMain}
      aria-label={`View resource details: ${resource.title}`}
    >
      <ResourceThumb
        icon={renderFormatIcon(formatInfo.category, 28)}
        thumbnailUrl={resource.thumbnailUrl}
        title={resource.title}
        totalFiles={totalFiles}
      />

      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          <div className={styles.cardTags}>
            <CategoryBadge category={resource.category} />
            {resource.isCompleted ? (
              <StatusBadge tone="success" label="Completed" />
            ) : null}
            <VisibilityTag visibility={resource.visibility} />
          </div>

          <span className={cn(styles.formatBadge, formatBadgeClass(formatInfo.category))}>
            {renderFormatIcon(formatInfo.category, 13)}
            {formatInfo.category.toUpperCase()}
          </span>
        </div>

        <h3 className={styles.cardTitle}>{resource.title}</h3>
        {resource.description ? (
          <div
            className={styles.cardDescription}
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(resource.description) }}
          />
        ) : null}

        {totalFiles > 0 ? (
          <div className={styles.filePreview}>
            <span className={styles.fileIcon}>
              {renderFormatIcon(formatInfo.category, 15)}
            </span>
            <span className={styles.fileName}>{fileName}</span>
          </div>
        ) : null}

        <div className={styles.cardFooter}>
          <div className={styles.metaRow}>
            <RatingStars
              rating={resource.rating}
              reviewCount={resource.totalReviews}
              size="sm"
            />
            <span className={styles.metaItem}>
              <ThumbsUp size={13} aria-hidden="true" />
              {resource.helpful}
            </span>
            {resource.views > 0 ? (
              <span className={styles.metaItem}>
                <Eye size={13} aria-hidden="true" />
                {resource.views.toLocaleString()}
              </span>
            ) : null}
            <span className={styles.metaItem}>{relativeDateLabel(resource.updated)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const ResourceCardFace = ({
  resource,
  isBusy,
  onEdit,
  onDelete,
}: ResourceCardProps): ReactElement => (
  <article className={styles.card}>
    <ResourceCardMain resource={resource} />
    <ResourceCardActions
      resource={resource}
      isBusy={isBusy}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  </article>
);

/** Catalog card for a single knowledge-base resource. Cover thumb + badges + metadata + hover preview, courses-style. */
export const ResourceCard = (props: ResourceCardProps): ReactElement => {
  const hover = useHoverPreview();

  return (
    <div
      ref={hover.ref}
      className={styles.cardWrapper}
      onMouseEnter={hover.onMouseEnter}
      onMouseLeave={hover.onMouseLeave}
    >
      <ResourceCardFace {...props} />
      {hover.side ? (
        <ResourceCardPreview resource={props.resource} side={hover.side} />
      ) : null}
    </div>
  );
};
