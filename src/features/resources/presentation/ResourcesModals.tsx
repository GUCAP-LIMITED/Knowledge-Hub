import type { ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { DetailsEditModal, MediaViewer, Modal, demoAsset } from '@shared/ui';
import type { Resource } from '../domain';
import type { UpdateResourceInput } from '../application';

/** Word-style resources preview inline as a fallback; everything else renders as a PDF. */
const kindFor = (resource: Resource): 'pdf' | 'doc' =>
  resource.type.toLowerCase().includes('document') ? 'doc' : 'pdf';

export interface ResourcesModalsProps {
  readonly active: Resource | null;
  readonly editing: Resource | null;
  readonly update: UseMutationResult<Resource, Error, UpdateResourceInput>;
  readonly onCloseView: () => void;
  readonly onCloseEdit: () => void;
}

/** The resource viewer (PDF/doc) + the admin edit modal. */
export const ResourcesModals = ({
  active,
  editing,
  update,
  onCloseView,
  onCloseEdit,
}: ResourcesModalsProps): ReactElement => (
  <>
    <Modal
      open={active !== null}
      onOpenChange={(next) => {
        if (!next) {
          onCloseView();
        }
      }}
      title={active?.title ?? 'Resource'}
      description={active ? `${active.type} · ${active.category}` : undefined}
      size="lg"
    >
      {active !== null ? (
        <MediaViewer asset={demoAsset(kindFor(active), active.title)} />
      ) : null}
    </Modal>

    <DetailsEditModal
      item={editing}
      heading="Edit resource"
      isSubmitting={update.isPending}
      onClose={onCloseEdit}
      onSave={(id, draft) => {
        update.mutate({ id, ...draft }, { onSuccess: onCloseEdit });
      }}
    />
  </>
);
