import { useState, type ReactElement } from 'react';
import { Alert, Button, Modal, Textarea } from '@shared/ui';
import styles from './ReviewRejectModal.module.css';

export interface ReviewRejectModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onConfirm: (reason: string) => Promise<void>;
  readonly isPending: boolean;
  readonly title?: string;
  readonly description?: string;
}

export const ReviewRejectModal = ({
  open,
  onClose,
  onConfirm,
  isPending,
  title = 'Reject Submission',
  description = 'Provide clear feedback explaining why these changes or this content was rejected so the author can make appropriate updates.',
}: ReviewRejectModalProps): ReactElement => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async (): Promise<void> => {
    if (!reason.trim()) {
      setError('Please provide a reason for rejecting this submission.');
      return;
    }
    setError(null);
    await onConfirm(reason.trim());
  };

  return (
    <Modal
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          setError(null);
          setReason('');
          onClose();
        }
      }}
      title={title}
      description={description}
    >
      <div className={styles.body}>
        {error && (
          <Alert tone="error" title="Validation Error">
            {error}
          </Alert>
        )}
        <Textarea
          label="Rejection Reason"
          value={reason}
          rows={5}
          placeholder="Explain what needs to be changed or corrected..."
          onChange={(e) => {
            setReason(e.target.value);
            if (error) setError(null);
          }}
        />
        <div className={styles.footer}>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              void handleConfirm();
            }}
            disabled={isPending || !reason.trim()}
          >
            {isPending ? 'Rejecting...' : 'Confirm Reject'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
