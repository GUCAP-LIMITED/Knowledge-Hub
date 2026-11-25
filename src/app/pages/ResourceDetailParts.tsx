import type { ReactElement } from 'react';
import {
  Award,
  Calendar,
  Download,
  Edit2,
  Eye,
  FolderTree,
  Hash,
  Paperclip,
  Play,
  Shield,
  ThumbsUp,
} from 'lucide-react';
import { type Resource, useMarkResourceHelpful } from '@features/resources';
import { getFormatInfo } from '@features/resources/presentation/resource-format-helper';
import { Button, HelpfulVoteButton, IconButton, Tooltip } from '@shared/ui';
import { cn, downloadFile } from '@shared/utils';
import styles from './ResourceDetailPage.module.css';

export interface ResourceHeroProps {
  readonly resource: Resource;
  readonly totalFiles: number;
  readonly hasCertificate: boolean;
  readonly isCertificateLoading: boolean;
  readonly onSelectDocument: (id: string) => void;
  readonly onViewCertificate: () => void;
}

const ResourceHeroBadges = ({
  category,
  type,
  visibility,
}: {
  readonly category?: string | undefined;
  readonly type: string;
  readonly visibility: string;
}): ReactElement => (
  <div className={styles.heroBadges}>
    {category ? <span className={styles.heroTag}>{category}</span> : null}
    <span className={cn(styles.heroTag, styles.heroTagInfo)}>{type}</span>
    {visibility === 'Team' ? (
      <span className={cn(styles.heroTag, styles.heroTagInfo)}>Team Only</span>
    ) : visibility === 'Private' ? (
      <span className={cn(styles.heroTag, styles.heroTagWarning)}>Private</span>
    ) : (
      <span className={cn(styles.heroTag, styles.heroTagSuccess)}>Public</span>
    )}
  </div>
);

const ResourceHeroActions = ({
  resource,
  hasCertificate,
  isCertificateLoading,
  onSelectDocument,
  onViewCertificate,
}: {
  readonly resource: Resource;
  readonly hasCertificate: boolean;
  readonly isCertificateLoading: boolean;
  readonly onSelectDocument: (id: string) => void;
  readonly onViewCertificate: () => void;
}): ReactElement => {
  const primaryFormat = getFormatInfo(
    resource.mediaUrl ?? '',
    resource.primaryMediaName ? resource.primaryMediaName : resource.title,
  );

  return (
    <div className={styles.heroActions}>
      <Button
        variant="accent"
        size="lg"
        onClick={() => {
          const id = resource.mediaUrl ? 'primary' : resource.attachments[0]?.id;
          if (id !== undefined) onSelectDocument(id);
        }}
      >
        <Play aria-hidden="true" />
        Read & Preview ({primaryFormat.label})
      </Button>

      {resource.mediaUrl ? (
        <Button asChild variant="outline" size="lg" className={styles.heroSecondary}>
          <a
            href={resource.mediaUrl}
            download={
              resource.primaryMediaName ? resource.primaryMediaName : resource.title
            }
            onClick={(e) => {
              e.preventDefault();
              if (resource.mediaUrl) {
                void downloadFile(
                  resource.mediaUrl,
                  resource.primaryMediaName ? resource.primaryMediaName : resource.title,
                );
              }
            }}
            title="Download primary document"
          >
            <Download aria-hidden="true" />
            Download File
          </a>
        </Button>
      ) : null}

      {hasCertificate ? (
        <Button
          variant="outline"
          size="lg"
          className={styles.heroSecondary}
          onClick={onViewCertificate}
          isLoading={isCertificateLoading}
          title="View certificate"
        >
          <Award aria-hidden="true" />
          View Certificate
        </Button>
      ) : null}
    </div>
  );
};

export const ResourceHero = ({
  resource,
  totalFiles,
  hasCertificate,
  isCertificateLoading,
  onSelectDocument,
  onViewCertificate,
}: ResourceHeroProps): ReactElement => (
  <header className={styles.hero}>
    <ResourceHeroBadges
      category={resource.category}
      type={resource.type}
      visibility={resource.visibility}
    />

    <h1 className={styles.heroTitle}>{resource.title}</h1>

    <div className={styles.heroMeta}>
      <span>
        <Calendar size={14} aria-hidden="true" />
        Updated {resource.updated.toLocaleDateString('en-GB')}
      </span>
      {resource.views > 0 ? (
        <span>
          <Eye size={14} aria-hidden="true" />
          {resource.views.toLocaleString()} views
        </span>
      ) : null}
      <span>
        <Paperclip size={14} aria-hidden="true" />
        {totalFiles} {totalFiles === 1 ? 'file' : 'files'}
      </span>
      {resource.helpful > 0 ? (
        <span>
          <ThumbsUp size={14} aria-hidden="true" />
          {resource.helpful} found helpful
        </span>
      ) : null}
    </div>

    <ResourceHeroActions
      resource={resource}
      hasCertificate={hasCertificate}
      isCertificateLoading={isCertificateLoading}
      onSelectDocument={onSelectDocument}
      onViewCertificate={onViewCertificate}
    />
  </header>
);

export interface ResourceSidebarProps {
  readonly resource: Resource;
  readonly totalFiles: number;
  readonly canEdit?: boolean;
  readonly onEditDetails?: () => void;
}

export const ResourceSidebar = ({
  resource,
  totalFiles,
  canEdit,
  onEditDetails,
}: ResourceSidebarProps): ReactElement => {
  const markHelpful = useMarkResourceHelpful();

  const rows = [
    { label: 'Category', value: resource.category, icon: Hash },
    { label: 'Resource Type', value: resource.type, icon: FolderTree },
    { label: 'Visibility', value: resource.visibility, icon: Shield },
    {
      label: 'Attached Files',
      value: `${String(totalFiles)} ${totalFiles === 1 ? 'file' : 'files'}`,
      icon: Paperclip,
    },
    {
      label: 'Last Updated',
      value: resource.updated.toLocaleDateString('en-GB'),
      icon: Calendar,
    },
  ];

  const handleVoteHelpful = (): void => {
    if (markHelpful.isPending) return;
    markHelpful.mutate({ id: resource.id });
  };

  return (
    <aside className={cn(styles.card, styles.detailsSidebar)}>
      <div className={styles.sidebarHead}>
        <h2 className={styles.sidebarTitle}>Resource Specs</h2>
        {canEdit && onEditDetails && (
          <Tooltip label="Edit resource details">
            <IconButton label="Edit resource details" onClick={onEditDetails}>
              <Edit2 size={14} aria-hidden="true" />
            </IconButton>
          </Tooltip>
        )}
      </div>
      {rows.map((row) => (
        <div key={row.label} className={styles.detailRow}>
          <row.icon size={16} aria-hidden="true" className={styles.detailIcon} />
          <div>
            <div className={styles.detailLabel}>{row.label}</div>
            <div className={styles.detailValue}>{row.value}</div>
          </div>
        </div>
      ))}

      <div className={styles.helpfulBox}>
        <HelpfulVoteButton
          isHelpful={resource.isHelpful}
          helpfulCount={resource.helpful}
          isPending={markHelpful.isPending}
          onVote={handleVoteHelpful}
        />
      </div>
    </aside>
  );
};
