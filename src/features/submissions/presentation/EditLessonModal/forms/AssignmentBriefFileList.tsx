import type { ReactElement } from 'react';
import { FileCheck, FolderOpen, ExternalLink, Trash2 } from 'lucide-react';
import { Button, Spinner } from '@shared/ui';
import type { CourseMediaAsset } from '@features/courses';
import { useGetMediaReadSas } from '@features/content';
import { formatFileSize } from '../../resource-file-types';

interface BriefItemInfoProps {
  readonly fileName?: string | undefined;
  readonly sizeBytes?: number | undefined;
}

const BriefItemInfo = ({ fileName, sizeBytes }: BriefItemInfoProps): ReactElement => {
  const displayName = fileName ?? 'Attachment';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--color-primary-light, rgba(59, 130, 246, 0.1))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: 'var(--color-primary)',
        }}
      >
        <FileCheck size={16} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={displayName}
        >
          {displayName}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {formatFileSize(sizeBytes)} &middot; Attached to lesson
        </div>
      </div>
    </div>
  );
};

interface BriefItemActionsProps {
  readonly fileId: string;
  readonly url?: string | null | undefined;
  readonly azureBlobName?: string | null | undefined;
  readonly contentId?: string | undefined;
  readonly isRemoving: boolean;
  readonly onRemove: (mediaAssetId: string) => Promise<void> | void;
}

const BriefItemActions = ({
  fileId,
  url,
  azureBlobName,
  contentId,
  isRemoving,
  onRemove,
}: BriefItemActionsProps): ReactElement => {
  const shouldFetchSas = !url && Boolean(azureBlobName && contentId);
  const { data: sasUrl, isLoading: isSasLoading } = useGetMediaReadSas(
    contentId ?? '',
    shouldFetchSas ? azureBlobName : undefined,
  );
  const effectiveUrl = url ?? sasUrl;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
      {isSasLoading ? (
        <Button variant="outline" size="sm" disabled>
          <Spinner size="sm" />
        </Button>
      ) : effectiveUrl ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            window.open(effectiveUrl, '_blank', 'noreferrer');
          }}
          title="Open / Download brief file"
        >
          <ExternalLink size={14} />
          <span>View</span>
        </Button>
      ) : null}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          void onRemove(fileId);
        }}
        title="Remove brief file"
        disabled={isRemoving}
      >
        <Trash2 size={14} style={{ color: 'var(--color-destructive)' }} />
      </Button>
    </div>
  );
};

interface AssignmentBriefItemProps {
  readonly file: CourseMediaAsset;
  readonly contentId?: string | undefined;
  readonly isRemoving: boolean;
  readonly onRemove: (mediaAssetId: string) => Promise<void> | void;
}

const AssignmentBriefItem = ({
  file,
  contentId,
  isRemoving,
  onRemove,
}: AssignmentBriefItemProps): ReactElement => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1rem',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--color-surface)',
      gap: '0.75rem',
    }}
  >
    <BriefItemInfo fileName={file.originalFileName} sizeBytes={file.sizeBytes} />
    <BriefItemActions
      fileId={file.id}
      url={file.url}
      azureBlobName={file.azureBlobName}
      contentId={contentId}
      isRemoving={isRemoving}
      onRemove={onRemove}
    />
  </div>
);

const EmptyBriefFiles = (): ReactElement => (
  <div
    style={{
      padding: '1.5rem',
      textAlign: 'center',
      border: '1px dashed var(--color-border)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--color-surface-sunken)',
    }}
  >
    <FolderOpen
      size={32}
      style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}
    />
    <div
      style={{
        fontSize: '0.875rem',
        fontWeight: 500,
        color: 'var(--color-text-secondary)',
      }}
    >
      No brief files attached yet
    </div>
    <div
      style={{
        fontSize: '0.75rem',
        color: 'var(--color-text-muted)',
        marginTop: '0.25rem',
      }}
    >
      Upload at least one file or document with assignment instructions for the learner.
    </div>
  </div>
);

export interface AssignmentBriefFileListProps {
  readonly briefFiles: readonly CourseMediaAsset[];
  readonly contentId?: string | undefined;
  readonly isLoading: boolean;
  readonly isRemoving: boolean;
  readonly onRemove: (mediaAssetId: string) => Promise<void> | void;
}

export const AssignmentBriefFileList = ({
  briefFiles,
  contentId,
  isLoading,
  isRemoving,
  onRemove,
}: AssignmentBriefFileListProps): ReactElement => {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
        <Spinner size="sm" />
      </div>
    );
  }

  if (briefFiles.length === 0) {
    return <EmptyBriefFiles />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <span
        style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
        }}
      >
        Attached Brief Files ({briefFiles.length}):
      </span>
      {briefFiles.map((file) => (
        <AssignmentBriefItem
          key={file.id}
          file={file}
          contentId={contentId}
          isRemoving={isRemoving}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};
