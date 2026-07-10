import type { ReactElement, ReactNode } from 'react';
import { Button } from '@shared/ui/Button/Button';
import { Modal } from '@shared/ui/Modal/Modal';
import styles from './ConfirmDialog.module.css';

export interface ConfirmDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly description?: ReactNode;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  /** Destructive actions use the red button; otherwise the primary teal. */
  readonly tone?: 'danger' | 'primary';
  readonly isBusy?: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

/** A focused confirmation step for irreversible or high-consequence actions. */
export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  isBusy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps): ReactElement => (
  <Modal
    open={open}
    onOpenChange={(next) => {
      if (!next) {
        onCancel();
      }
    }}
    title={title}
    footer={
      <div className={styles.footer}>
        <Button variant="ghost" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={tone} isLoading={isBusy} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    }
  >
    {description !== undefined ? <p className={styles.body}>{description}</p> : null}
  </Modal>
);
