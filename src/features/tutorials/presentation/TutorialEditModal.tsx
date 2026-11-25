import type { ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { LearningContentEditModal } from '@features/content';
import type { Difficulty, Tutorial } from '../domain';
import type { UpdateTutorialInput } from '../application';

import type { ContentCategory } from '@features/content';

export interface TutorialEditModalProps {
  readonly editing: Tutorial | null;
  readonly categories?: readonly ContentCategory[] | readonly string[];
  readonly update: UseMutationResult<Tutorial, Error, UpdateTutorialInput>;
  readonly onClose: () => void;
}

/**
 * Edit modal for tutorials leveraging the unified, reusable LearningContentEditModal.
 * Category and Difficulty options are loaded dynamically from the backend,
 * and the modal features a fixed blurred header, dedicated scroll area, and fixed action footer.
 */
export const TutorialEditModal = ({
  editing,
  update,
  onClose,
}: TutorialEditModalProps): ReactElement => (
  <LearningContentEditModal
    item={editing}
    contentType="tutorial"
    heading="Edit tutorial"
    isSubmitting={update.isPending}
    onClose={onClose}
    onSave={(payload) => {
      update.mutate(
        {
          id: payload.id,
          title: payload.title,
          category: payload.category,
          categoryId: payload.categoryId,
          duration: payload.duration,
          durationSeconds: payload.durationSeconds,
          difficulty: payload.difficulty as Difficulty,
          description: payload.description,
        },
        { onSuccess: onClose },
      );
    }}
  />
);
