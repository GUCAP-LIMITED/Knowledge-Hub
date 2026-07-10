import type { ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { DetailsEditModal, MediaViewer, Modal, demoAsset } from '@shared/ui';
import { QuizManagerModal } from '@features/quizzes';
import type { Tutorial } from '../domain';
import type { UpdateTutorialInput } from '../application';

export interface TutorialsModalsProps {
  readonly watching: Tutorial | null;
  readonly editing: Tutorial | null;
  readonly quizzing: Tutorial | null;
  readonly isAdmin: boolean;
  readonly update: UseMutationResult<Tutorial, Error, UpdateTutorialInput>;
  readonly onCloseWatch: () => void;
  readonly onCloseEdit: () => void;
  readonly onCloseQuiz: () => void;
}

/** The tutorial video player + admin edit modal + quiz manager. */
export const TutorialsModals = ({
  watching,
  editing,
  quizzing,
  isAdmin,
  update,
  onCloseWatch,
  onCloseEdit,
  onCloseQuiz,
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

    {quizzing !== null ? (
      <QuizManagerModal
        open
        contentId={quizzing.id}
        contentKind="tutorial"
        contentTitle={quizzing.title}
        isAdmin={isAdmin}
        onClose={onCloseQuiz}
      />
    ) : null}
  </>
);
