import type { ReactElement } from 'react';
import { Button, Modal } from '@shared/ui';
import { type ContentKind, KIND_META } from './content-types-model';
import styles from './ContentTypesManager.module.css';

export interface DeleteTarget {
  readonly kind: ContentKind;
  readonly name: string;
}

export interface ConfirmDeleteModalProps {
  readonly target: DeleteTarget | null;
  readonly onCancel: () => void;
  readonly onConfirm: (target: DeleteTarget) => void;
}

/** Confirmation step before a type is removed — no destructive action without intent. */
export const ConfirmDeleteModal = ({
  target,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps): ReactElement => (
  <Modal
    open={target !== null}
    onOpenChange={(next) => {
      if (!next) {
        onCancel();
      }
    }}
    title="Remove content type"
    description="This updates the upload wizard and catalog filters immediately."
    footer={
      target !== null ? (
        <div className={styles.confirmFooter}>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onConfirm(target);
            }}
          >
            Remove type
          </Button>
        </div>
      ) : null
    }
  >
    {target !== null ? (
      <p className={styles.confirmBody}>
        Remove <strong>“{target.name}”</strong> from {KIND_META[target.kind].label} types?
        Existing content keeps its label, but it won’t be selectable for new uploads.
      </p>
    ) : null}
  </Modal>
);
