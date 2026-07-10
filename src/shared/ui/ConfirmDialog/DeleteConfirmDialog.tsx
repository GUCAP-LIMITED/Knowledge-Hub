import type { ReactElement } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

export interface DeleteConfirmDialogProps {
  /** The item pending deletion, or null when the dialog is closed. */
  readonly item: { readonly id: string; readonly title: string } | null;
  /** Lowercase noun for the copy, e.g. "course" → "Delete course?". */
  readonly noun: string;
  readonly isBusy?: boolean;
  readonly onConfirm: (id: string) => void;
  readonly onCancel: () => void;
}

/** Standard "delete this thing?" confirmation, shared by the catalog pages. */
export const DeleteConfirmDialog = ({
  item,
  noun,
  isBusy = false,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps): ReactElement => (
  <ConfirmDialog
    open={item !== null}
    title={`Delete ${noun}?`}
    description={
      item !== null ? (
        <>“{item.title}” will be permanently removed. This can’t be undone.</>
      ) : undefined
    }
    confirmLabel={`Delete ${noun}`}
    isBusy={isBusy}
    onConfirm={() => {
      if (item !== null) {
        onConfirm(item.id);
      }
    }}
    onCancel={onCancel}
  />
);
