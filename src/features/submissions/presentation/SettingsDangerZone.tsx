import { useState, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ConfirmDialog } from '@shared/ui';
import { useDeleteContent, type ContentDetail } from '@features/content';
import { useMyCapabilities } from '@features/users';
import styles from './SettingsDangerZone.module.css';

export interface SettingsDangerZoneProps {
  readonly content: ContentDetail;
  readonly contentTypeKey: 'course' | 'tutorial' | 'resource';
  readonly contentTypeName: string;
}

interface DangerZoneBannerProps {
  readonly contentTypeKey: string;
  readonly contentTypeName: string;
  readonly onDeleteClick: () => void;
}

const DangerZoneBanner = ({
  contentTypeKey,
  contentTypeName,
  onDeleteClick,
}: DangerZoneBannerProps): ReactElement => (
  <div className={styles.zone}>
    <h3 className={styles.heading}>Danger Zone</h3>
    <p className={styles.lead}>
      Once you delete a {contentTypeKey}, there is no going back. Please be certain.
    </p>

    <div className={styles.panel} role="alert">
      <div className={styles.copy}>
        <p className={styles.title}>Delete this {contentTypeKey}</p>
        <p className={styles.body}>
          This will permanently delete the {contentTypeKey} and all associated data.
        </p>
      </div>
      <Button variant="ghost" className={styles.action} onClick={onDeleteClick}>
        Delete {contentTypeName}
      </Button>
    </div>
  </div>
);

export const SettingsDangerZone = ({
  content,
  contentTypeKey,
  contentTypeName,
}: SettingsDangerZoneProps): ReactElement => {
  const navigate = useNavigate();
  const deleteContentMutation = useDeleteContent();
  const { can } = useMyCapabilities();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const canDelete = can('submissions', 'delete') && (content.canModify ?? false);

  if (!canDelete) {
    return <></>;
  }

  const handleDelete = async (): Promise<void> => {
    await deleteContentMutation.mutateAsync(content.id);
    navigate('/submissions');
  };

  return (
    <>
      <DangerZoneBanner
        contentTypeKey={contentTypeKey}
        contentTypeName={contentTypeName}
        onDeleteClick={() => {
          setIsDeleteDialogOpen(true);
        }}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
        }}
        title={`Delete this ${contentTypeKey}?`}
        description={`This action cannot be undone. All lessons, media associations, and revisions for this ${contentTypeKey} will be permanently removed.`}
        confirmLabel="Delete permanently"
        cancelLabel="Cancel"
        tone="danger"
        isBusy={deleteContentMutation.isPending}
        onConfirm={() => {
          void handleDelete();
        }}
      />
    </>
  );
};
