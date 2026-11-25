import { type ReactElement } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2, Eye } from 'lucide-react';
import type { EditableLesson } from './types';
import { LessonTypeIcon } from './LessonTypeIcon';
import styles from './EditSubmissionPage.module.css';

export interface SortableLessonProps {
  readonly lesson: EditableLesson;
  readonly onRemove: () => void;
  readonly onEdit: () => void;
  readonly onPreview?: (() => void) | undefined;
  readonly readOnly?: boolean | undefined;
  readonly canEdit?: boolean | undefined;
  readonly canDelete?: boolean | undefined;
}

interface LessonActionsProps {
  readonly onPreview?: (() => void) | undefined;
  readonly onEdit: () => void;
  readonly onRemove: () => void;
  readonly isEditable: boolean;
  readonly isDeletable: boolean;
}

const LessonActions = ({
  onPreview,
  onEdit,
  onRemove,
  isEditable,
  isDeletable,
}: LessonActionsProps): ReactElement => (
  <div className={styles.lessonActions}>
    {onPreview && (
      <Eye
        size={16}
        style={{ cursor: 'pointer', color: 'var(--color-primary)' }}
        aria-label="Preview Lesson"
        onClick={onPreview}
      />
    )}
    {isEditable && (
      <Pencil
        size={16}
        style={{ cursor: 'pointer' }}
        aria-label="Edit Lesson"
        onClick={onEdit}
      />
    )}
    {isDeletable && (
      <Trash2
        size={16}
        style={{ cursor: 'pointer', color: 'var(--color-danger)' }}
        aria-label="Delete Lesson"
        onClick={onRemove}
      />
    )}
  </div>
);

export const SortableLesson = ({
  lesson,
  onRemove,
  onEdit,
  onPreview,
  readOnly = false,
  canEdit = !readOnly,
  canDelete = !readOnly,
}: SortableLessonProps): ReactElement => {
  const isEditable = !readOnly && canEdit;
  const isDeletable = !readOnly && canDelete;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: lesson.id,
      data: { type: 'Lesson', lesson },
      disabled: !isEditable,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.lessonItem}>
      <div className={styles.lessonInfo}>
        {isEditable && (
          <div {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex' }}>
            <GripVertical size={14} opacity={0.3} />
          </div>
        )}
        <LessonTypeIcon kind={lesson.kind} size={16} />
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            opacity: 0.6,
            minWidth: '1.5rem',
          }}
        >
          #{lesson.displayOrder + 1}
        </span>
        <span style={{ fontWeight: 500 }}>{lesson.title}</span>
      </div>
      <LessonActions
        onPreview={onPreview}
        onEdit={onEdit}
        onRemove={onRemove}
        isEditable={isEditable}
        isDeletable={isDeletable}
      />
    </div>
  );
};
