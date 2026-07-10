import { useCallback, useState, type ReactElement } from 'react';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

interface Deletable {
  readonly id: string;
  readonly title: string;
}

export interface UseDeleteConfirmResult {
  /** Ask to delete the item with this id — opens the confirmation dialog. */
  readonly request: (id: string) => void;
  /** The confirmation dialog element to render once in the page. */
  readonly dialog: ReactElement;
}

/**
 * Encapsulates the "confirm before deleting" flow: tracks which item is pending, renders the
 * dialog, and calls `onDelete` only after the user confirms. Keeps catalog pages small.
 */
export const useDeleteConfirm = (
  items: readonly Deletable[],
  noun: string,
  onDelete: (id: string) => void,
  isBusy = false,
): UseDeleteConfirmResult => {
  const [pending, setPending] = useState<Deletable | null>(null);
  const request = useCallback(
    (id: string): void => {
      setPending(items.find((item) => item.id === id) ?? null);
    },
    [items],
  );
  const dialog = (
    <DeleteConfirmDialog
      item={pending}
      noun={noun}
      isBusy={isBusy}
      onConfirm={(id) => {
        onDelete(id);
        setPending(null);
      }}
      onCancel={() => {
        setPending(null);
      }}
    />
  );
  return { request, dialog };
};
