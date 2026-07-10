import type { ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { DetailsEditModal, MediaViewer, Modal, demoAsset } from '@shared/ui';
import { QuizManagerModal } from '@features/quizzes';
import type { Resource } from '../domain';
import type { UpdateResourceInput } from '../application';

/** Word-style resources preview inline as a fallback; everything else renders as a PDF. */
const kindFor = (resource: Resource): 'pdf' | 'doc' =>
  resource.type.toLowerCase().includes('document') ? 'doc' : 'pdf';

export interface ResourcesModalsProps {
  readonly active: Resource | null;
  readonly editing: Resource | null;
  readonly quizzing: Resource | null;
  readonly isAdmin: boolean;
  readonly update: UseMutationResult<Resource, Error, UpdateResourceInput>;
  readonly onCloseView: () => void;
  readonly onCloseEdit: () => void;
  readonly onCloseQuiz: () => void;
}

/** The resource viewer (PDF/doc) + the admin edit modal + the quiz manager. */
export const ResourcesModals = ({
  active,
  editing,
  quizzing,
  isAdmin,
  update,
  onCloseView,
  onCloseEdit,
  onCloseQuiz,
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

    {quizzing !== null ? (
      <QuizManagerModal
        open
        contentId={quizzing.id}
        contentKind="resource"
        contentTitle={quizzing.title}
        isAdmin={isAdmin}
        onClose={onCloseQuiz}
      />
    ) : null}
  </>
);
