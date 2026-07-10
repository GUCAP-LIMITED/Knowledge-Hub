import type { ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import {
  DetailsEditModal,
  type EditFieldConfig,
  type MediaAsset,
  MediaViewer,
  Modal,
  demoAsset,
  uploadedAsset,
} from '@shared/ui';
import { QuizManagerModal } from '@features/quizzes';
import { useContentTypes } from '@features/content-types';
import { DIFFICULTIES, type Difficulty, type Tutorial } from '../domain';
import type { UpdateTutorialInput } from '../application';

const tutorialAsset = (tutorial: Tutorial): MediaAsset =>
  tutorial.mediaUrl !== null
    ? uploadedAsset(tutorial.mediaUrl, tutorial.title)
    : demoAsset('video', tutorial.title);

const tutorialFields = (
  tutorial: Tutorial,
  categories: readonly string[],
): readonly EditFieldConfig[] => [
  { name: 'title', label: 'Title', kind: 'text', initial: tutorial.title },
  {
    name: 'category',
    label: 'Category',
    kind: 'select',
    initial: tutorial.category,
    options: categories,
  },
  { name: 'duration', label: 'Duration', kind: 'text', initial: tutorial.duration },
  {
    name: 'difficulty',
    label: 'Difficulty',
    kind: 'select',
    initial: tutorial.difficulty,
    options: DIFFICULTIES,
  },
  {
    name: 'description',
    label: 'Description',
    kind: 'textarea',
    initial: tutorial.description,
  },
  {
    name: 'content',
    label: 'Replace video / file',
    kind: 'file',
    initial: '',
    accept: 'video/*,application/pdf',
  },
  {
    name: 'thumbnail',
    label: 'Cover image',
    kind: 'file',
    initial: '',
    accept: 'image/*',
  },
];

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
}: TutorialsModalsProps): ReactElement => {
  const categories = useContentTypes('tutorial');
  return (
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
        {watching !== null ? <MediaViewer asset={tutorialAsset(watching)} /> : null}
      </Modal>

      <DetailsEditModal
        item={editing === null ? null : { id: editing.id }}
        heading="Edit tutorial"
        fields={editing === null ? [] : tutorialFields(editing, categories)}
        isSubmitting={update.isPending}
        onClose={onCloseEdit}
        onSave={(id, draft) => {
          update.mutate(
            {
              id,
              title: draft.title ?? '',
              category: draft.category ?? '',
              duration: draft.duration ?? '',
              difficulty: (draft.difficulty ?? 'Beginner') as Difficulty,
              description: draft.description ?? '',
              ...(draft.content !== undefined && draft.content !== ''
                ? { mediaUrl: draft.content }
                : {}),
              ...(draft.thumbnail !== undefined && draft.thumbnail !== ''
                ? { thumbnailUrl: draft.thumbnail }
                : {}),
            },
            { onSuccess: onCloseEdit },
          );
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
};
