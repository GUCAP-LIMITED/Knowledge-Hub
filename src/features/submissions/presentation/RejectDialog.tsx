import { useEffect, useState, type ReactElement } from 'react';
import { Alert, Button, Modal, TextField } from '@shared/ui';

export interface RejectDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onConfirm: (reason: string) => void;
  readonly isSubmitting: boolean;
  readonly error?: string | undefined;
}

/** Confirms a rejection and collects the required reason (shared with the author). */
export const RejectDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
  error,
}: RejectDialogProps): ReactElement => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) {
      setReason('');
    }
  }, [open]);

  const canReject = reason.trim().length > 0;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Reject submission"
      description="Tell the author why — this reason is shared with them."
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={isSubmitting}
            disabled={!canReject}
            onClick={() => {
              onConfirm(reason.trim());
            }}
          >
            Reject
          </Button>
        </>
      }
    >
      {error !== undefined ? (
        <Alert tone="error" title="Could not reject">
          {error}
        </Alert>
      ) : null}
      <TextField
        label="Reason"
        placeholder="e.g. Superseded by the January policy update"
        value={reason}
        onChange={(event) => {
          setReason(event.target.value);
        }}
      />
    </Modal>
  );
};
