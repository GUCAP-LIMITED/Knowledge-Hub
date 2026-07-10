import type { ReactElement } from 'react';
import { ContentReviewsPanel } from './ContentReviewsPanel';

export interface CourseReviewsPanelProps {
  readonly courseId: string;
  readonly courseName: string;
}

/** Reviews block for one course — a thin wrapper over the content-neutral panel. */
export const CourseReviewsPanel = ({
  courseId,
  courseName,
}: CourseReviewsPanelProps): ReactElement => (
  <ContentReviewsPanel contentId={courseId} contentName={courseName} />
);
