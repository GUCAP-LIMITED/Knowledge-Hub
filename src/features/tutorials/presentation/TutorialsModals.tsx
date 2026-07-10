import type { ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { DetailsEditModal, MediaViewer, Modal, demoAsset } from '@shared/ui';
import type { Tutorial } from '../domain';
import type { UpdateTutorialInput } from '../application';

export interface TutorialsModalsProps {
  readonly watching: Tutorial | null;
  readonly editing: Tutorial | null;
  readonly update: UseMutationResult<Tutorial, Error, UpdateTutorialInput>;
  readonly onCloseWatch: () => void;
  readonly onCloseEdit: () => void;
}

/** The tutorial video player + the admin edit modal (which drives the update mutation). */
export const TutorialsModals = ({
  watching,
  editing,
  update,
  onCloseWatch,
  onCloseEdit,
}: TutorialsModalsProps): ReactElement => (
  <>
    <Modal
      open={watching !== null}
      onOpenChange={(next) => {
        if (!next) {
          onCloseWatch();
        }
      }}
      title={watching?.title ?? 'Tutorial'}
      description={watching ? `${watching.category} · ${watching.duration}` : undefined}
      size="lg"
    >
      {watching !== null ? (
        <MediaViewer asset={demoAsset('video', watching.title)} />
      ) : null}
    </Modal>

    <DetailsEditModal
      item={editing}
      heading="Edit tutorial"
      isSubmitting={update.isPending}
      onClose={onCloseEdit}
      onSave={(id, draft) => {
        update.mutate({ id, ...draft }, { onSuccess: onCloseEdit });
      }}
    />
  </>
);
