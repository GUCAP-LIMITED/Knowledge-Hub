import type { ReactElement } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { IconButton } from '@shared/ui';
import { useMyCapabilities } from '@features/users';
import type { Course } from '../domain';
import styles from './CoursesPage.module.css';

export interface CourseCardAdminProps {
  readonly course: Course;
  readonly isBusy: boolean;
  readonly onEdit: (course: Course) => void;
  readonly onDelete: (id: string) => void;
}

/** Capability-gated edit/delete controls for a course card. */
export const CourseCardAdmin = ({
  course,
  isBusy,
  onEdit,
  onDelete,
}: CourseCardAdminProps): ReactElement | null => {
  const { can } = useMyCapabilities();
  const canEdit = can('courses', 'edit') && course.canModify;
  const canDelete = can('courses', 'delete') && course.canModify;
  if (!canEdit && !canDelete) {
    return null;
  }
  return (
    <div className={styles.cardAdmin}>
      {canEdit ? (
        <IconButton
          label="Edit course"
          onClick={() => {
            onEdit(course);
          }}
        >
          <Pencil size={15} />
        </IconButton>
      ) : null}
      {canDelete ? (
        <IconButton
          label="Delete course"
          variant="danger"
          disabled={isBusy}
          onClick={() => {
            onDelete(course.id);
          }}
        >
          <Trash2 size={15} />
        </IconButton>
      ) : null}
    </div>
  );
};
