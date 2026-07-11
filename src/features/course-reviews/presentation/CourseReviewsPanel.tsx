import type { ReactElement } from 'react';
import { ContentReviewsPanel } from './ContentReviewsPanel';

export interface CourseReviewsPanelProps {
  readonly courseId: string;
  readonly courseName: string;
  /** Whether the learner may leave a review yet (course completed + any quiz passed). */
  readonly canReview: boolean;
}

/** Reviews block for one course — a thin wrapper over the content-neutral panel. */
export const CourseReviewsPanel = ({
  courseId,
  courseName,
  canReview,
}: CourseReviewsPanelProps): ReactElement => (
  <ContentReviewsPanel
    contentId={courseId}
    contentName={courseName}
    canReview={canReview}
  />
);
