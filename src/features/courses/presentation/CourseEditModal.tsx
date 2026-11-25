import type { ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { LearningContentEditModal } from '@features/content';
import type { Course, Difficulty } from '../domain';
import type { UpdateCourseInput } from '../application';

export interface CourseEditModalProps {
  readonly editing: Course | null;
  readonly update: UseMutationResult<Course, Error, UpdateCourseInput>;
  readonly onClose: () => void;
}

/**
 * Edit modal for courses leveraging the unified, reusable LearningContentEditModal.
 * Category and Difficulty options are loaded dynamically from the backend,
 * and the modal features a fixed blurred header, dedicated scroll area, and fixed action footer.
 */
export const CourseEditModal = ({
  editing,
  update,
  onClose,
}: CourseEditModalProps): ReactElement => (
  <LearningContentEditModal
    item={editing}
    contentType="course"
    heading="Edit course"
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
        {
          onSuccess: onClose,
        },
      );
    }}
  />
);
