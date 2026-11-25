/* eslint-disable max-lines-per-function */
import { type ReactElement } from 'react';
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@shared/ui';
import type { EditableSection } from './types';
import { SortableLesson } from './SortableLesson';
import styles from './EditSubmissionPage.module.css';

export interface SortableSectionProps {
  readonly section: EditableSection;
  readonly onRemoveSection: () => void;
  readonly onAddLesson: () => void;
  readonly onRemoveLesson: (lessonId: string) => void;
  readonly onEditSection: () => void;
  readonly onEditLesson: (lessonId: string) => void;
  readonly onPreviewLesson?: ((lessonId: string) => void) | undefined;
  readonly readOnly?: boolean | undefined;
  readonly canEdit?: boolean | undefined;
  readonly canDelete?: boolean | undefined;
}

interface SectionHeaderActionsProps {
  readonly isEditable: boolean;
  readonly isDeletable: boolean;
  readonly lessonCount: number;
  readonly onEditSection: () => void;
  readonly onRemoveSection: () => void;
}

const SectionHeaderActions = ({
  isEditable,
  isDeletable,
  lessonCount,
  onEditSection,
  onRemoveSection,
}: SectionHeaderActionsProps): ReactElement => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.8 }}>
    {isEditable && (
      <Pencil
        size={14}
        style={{ cursor: 'pointer' }}
        aria-label="Edit Section Title"
        onClick={onEditSection}
      />
    )}
    {isDeletable && (
      <Trash2
        size={14}
        style={{ cursor: 'pointer' }}
        aria-label="Delete Section"
        onClick={onRemoveSection}
      />
    )}
    <span style={{ fontSize: '0.85rem' }}>{lessonCount} lessons</span>
  </div>
);

export const SortableSection = ({
  section,
  onRemoveSection,
  onAddLesson,
  onRemoveLesson,
  onEditSection,
  onEditLesson,
  onPreviewLesson,
  readOnly = false,
  canEdit = !readOnly,
  canDelete = !readOnly,
}: SortableSectionProps): ReactElement => {
  const isEditable = !readOnly && canEdit;
  const isDeletable = !readOnly && canDelete;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: section.id,
      data: { type: 'Section', section },
      disabled: !isEditable,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.sectionItem}>
      <div className={styles.sectionHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isEditable && (
            <div
              {...attributes}
              {...listeners}
              style={{ cursor: 'grab', display: 'flex' }}
            >
              <GripVertical size={16} opacity={0.5} />
            </div>
          )}
          <span style={{ fontWeight: 600 }}>
            Section {section.displayOrder + 1}: {section.title}
          </span>
        </div>
        <SectionHeaderActions
          isEditable={isEditable}
          isDeletable={isDeletable}
          lessonCount={section.lessons.length}
          onEditSection={onEditSection}
          onRemoveSection={onRemoveSection}
        />
      </div>

      <div className={styles.lessonList}>
        <SortableContext
          items={section.lessons.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {section.lessons.map((lesson) => (
            <SortableLesson
              key={lesson.id}
              lesson={lesson}
              readOnly={readOnly}
              canEdit={canEdit}
              canDelete={canDelete}
              onRemove={() => {
                onRemoveLesson(lesson.id);
              }}
              onEdit={() => {
                onEditLesson(lesson.id);
              }}
              onPreview={
                onPreviewLesson
                  ? () => {
                      onPreviewLesson(lesson.id);
                    }
                  : undefined
              }
            />
          ))}
        </SortableContext>
        {!readOnly && canEdit && (
          <Button
            variant="ghost"
            size="sm"
            style={{ alignSelf: 'flex-start', margin: '8px 0 4px 0' }}
            onClick={onAddLesson}
          >
            <Plus size={14} style={{ marginRight: '4px' }} /> Add Lesson
          </Button>
        )}
      </div>
    </div>
  );
};
