/* eslint-disable max-lines, max-lines-per-function, complexity, @typescript-eslint/no-unsafe-assignment */
import type { ReactElement } from 'react';
import { Plus, Settings, FolderOpen, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  type Lesson,
  type LessonKind,
  type Section,
  nextId,
} from './upload-content-types';
import type { StudioSelection } from './CourseStudioStep';
import { formatSectionDisplay, formatLessonDisplay } from './curriculum-display';
import { LessonTypeIcon } from './LessonTypeIcon';
import { lessonIssues, sectionHasIssues } from './curriculum-validation';
import { RequiredMessage, ShakeOnAttempt } from './RequiredHint';
import { useIsFlagged, useSubmitAttempt } from './submit-attempt-context';
import styles from './CourseStudioStep.module.css';
import { cn } from '@shared/utils';
import { Button } from '@shared/ui';

export const LessonIcon = ({
  kind,
  size = 14,
}: {
  readonly kind: LessonKind;
  readonly size?: number;
}): ReactElement => <LessonTypeIcon kind={kind} size={size} />;

interface LessonNodeProps {
  readonly lesson: Lesson;
  readonly lIndex: number;
  readonly sectionId: string;
  readonly selection: StudioSelection;
  readonly setSelection: (s: StudioSelection) => void;
}

const LessonNode = ({
  lesson,
  lIndex,
  sectionId,
  selection,
  setSelection,
}: LessonNodeProps): ReactElement => {
  const lessonDisplay = formatLessonDisplay(lesson.title, lIndex);
  const isActive = selection.type === 'lesson' && selection.lessonId === lesson.id;
  const flagged = useSubmitAttempt() > 0 && lessonIssues(lesson).length > 0;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: lesson.id,
      data: { type: 'Lesson', lesson, sectionId },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        styles.studioTreeNode,
        styles.studioTreeLesson,
        isActive && styles.studioTreeNodeActive,
        flagged && styles.studioTreeNodeInvalid,
      )}
      onClick={() => {
        setSelection({
          type: 'lesson',
          lessonId: lesson.id,
          sectionId,
        });
      }}
    >
      <div
        {...attributes}
        {...listeners}
        style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}
        onClick={(e) => {
          e.stopPropagation();
        }}
        aria-label="Drag to reorder lesson"
      >
        <GripVertical size={12} opacity={0.4} />
      </div>
      <LessonIcon kind={lesson.kind} />
      <span className={styles.studioTreeIndexBadge}>{lessonDisplay.indexBadge}</span>
      <span
        className={cn(
          styles.studioTreeLessonTitle,
          lessonDisplay.isUntitled && styles.studioTreeUntitled,
        )}
      >
        {lessonDisplay.displayTitle}
      </span>
    </div>
  );
};

const SectionNode = ({
  section,
  sIndex,
  selection,
  setSelection,
  updateSection,
}: {
  readonly section: Section;
  readonly sIndex: number;
  readonly selection: StudioSelection;
  readonly setSelection: (s: StudioSelection) => void;
  readonly updateSection: (s: Section) => void;
}): ReactElement => {
  const sectionDisplay = formatSectionDisplay(section.title, sIndex);
  const flagged = useSubmitAttempt() > 0 && sectionHasIssues(section);
  const addLessonFlagged = useIsFlagged(section.lessons.length === 0);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: section.id,
      data: { type: 'Section', section },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.studioSectionBlock}>
      <div
        className={cn(
          styles.studioTreeNode,
          styles.studioTreeSection,
          selection.type === 'section' &&
            selection.sectionId === section.id &&
            styles.studioTreeNodeActive,
          flagged && styles.studioTreeNodeInvalid,
        )}
        onClick={() => {
          setSelection({ type: 'section', sectionId: section.id });
        }}
      >
        <div
          {...attributes}
          {...listeners}
          style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          aria-label="Drag to reorder section"
        >
          <GripVertical size={14} opacity={0.4} />
        </div>
        <FolderOpen size={16} />
        <span className={styles.studioTreeIndexBadge}>{sectionDisplay.indexBadge}</span>
        <span
          className={cn(
            styles.studioTreeTitle,
            sectionDisplay.isUntitled && styles.studioTreeUntitled,
          )}
        >
          {sectionDisplay.displayTitle}
        </span>
      </div>

      <div className={styles.studioLessonsList}>
        <SortableContext
          items={section.lessons.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {section.lessons.map((lesson, lIndex) => (
            <LessonNode
              key={lesson.id}
              lesson={lesson}
              lIndex={lIndex}
              sectionId={section.id}
              selection={selection}
              setSelection={setSelection}
            />
          ))}
        </SortableContext>
        <Button
          variant="outline"
          size="xs"
          className={cn(
            styles.studioAddBtn,
            addLessonFlagged && styles.studioAddBtnInvalid,
          )}
          onClick={(e) => {
            e.stopPropagation();
            updateSection({
              ...section,
              lessons: [
                ...section.lessons,
                {
                  id: nextId('lesson'),
                  title: '',
                  kind: 'video',
                  displayOrder: section.lessons.length,
                },
              ],
            });
          }}
        >
          <Plus aria-hidden="true" /> Add Lesson
        </Button>
      </div>
    </div>
  );
};

export const StudioSidebar = ({
  sections,
  onSections,
  selection,
  setSelection,
  courseFlagged = false,
}: {
  readonly sections: readonly Section[];
  readonly onSections: (sections: readonly Section[]) => void;
  readonly selection: StudioSelection;
  readonly setSelection: (s: StudioSelection) => void;
  /** Course media (thumbnail) is still missing after a blocked publish. */
  readonly courseFlagged?: boolean;
}): ReactElement => {
  const addSectionFlagged = useIsFlagged(sections.length === 0);
  const updateSection = (updatedSection: Section): void => {
    onSections(sections.map((s) => (s.id === updatedSection.id ? updatedSection : s)));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === 'Section' && overType === 'Section') {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
        const moved = arrayMove([...sections], oldIndex, newIndex);
        onSections(moved.map((s, idx) => ({ ...s, displayOrder: idx })));
      }
      return;
    }

    if (activeType === 'Lesson') {
      const activeSectionId = active.data.current?.sectionId;
      const overSectionId =
        overType === 'Lesson'
          ? over.data.current?.sectionId
          : overType === 'Section'
            ? over.id
            : null;

      if (!activeSectionId || !overSectionId) return;

      const sourceSection = sections.find((s) => s.id === activeSectionId);
      const targetSection = sections.find((s) => s.id === overSectionId);
      if (!sourceSection || !targetSection) return;

      if (activeSectionId === overSectionId) {
        const oldIndex = sourceSection.lessons.findIndex((l) => l.id === active.id);
        const newIndex = sourceSection.lessons.findIndex((l) => l.id === over.id);
        if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
          const movedLessons = arrayMove([...sourceSection.lessons], oldIndex, newIndex);
          const updatedLessons = movedLessons.map((l, idx) => ({
            ...l,
            displayOrder: idx,
          }));
          onSections(
            sections.map((s) =>
              s.id === sourceSection.id ? { ...s, lessons: updatedLessons } : s,
            ),
          );
        }
      } else {
        const lesson = sourceSection.lessons.find((l) => l.id === active.id);
        if (!lesson) return;

        const overIndex = targetSection.lessons.findIndex((l) => l.id === over.id);
        const newSourceLessons = sourceSection.lessons
          .filter((l) => l.id !== active.id)
          .map((l, idx) => ({ ...l, displayOrder: idx }));

        const newTargetLessons = [...targetSection.lessons];
        const insertAt = overIndex >= 0 ? overIndex : newTargetLessons.length;
        newTargetLessons.splice(insertAt, 0, lesson);
        const reindexedTarget = newTargetLessons.map((l, idx) => ({
          ...l,
          displayOrder: idx,
        }));

        onSections(
          sections.map((s) => {
            if (s.id === sourceSection.id) return { ...s, lessons: newSourceLessons };
            if (s.id === targetSection.id) return { ...s, lessons: reindexedTarget };
            return s;
          }),
        );
      }
    }
  };

  return (
    <div className={styles.studioSidebar}>
      <div className={styles.studioSidebarHeader}>
        <h3 className={styles.studioSidebarTitle}>Curriculum Outline</h3>
      </div>
      <div className={styles.studioTree}>
        <div
          className={cn(
            styles.studioTreeNode,
            selection.type === 'course' && styles.studioTreeNodeActive,
            courseFlagged && styles.studioTreeNodeInvalid,
          )}
          onClick={() => {
            setSelection({ type: 'course' });
          }}
        >
          <Settings size={16} />
          <span>Course Settings</span>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className={styles.studioSections}>
              {sections.map((section, sIndex) => (
                <SectionNode
                  key={section.id}
                  section={section}
                  sIndex={sIndex}
                  selection={selection}
                  setSelection={setSelection}
                  updateSection={updateSection}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <div style={{ marginTop: '1rem', marginLeft: '1rem' }}>
          <ShakeOnAttempt invalid={sections.length === 0}>
            <Button
              variant="outline"
              size="xs"
              className={cn(
                styles.studioAddBtn,
                styles.studioAddBtnFlush,
                addSectionFlagged && styles.studioAddBtnInvalid,
              )}
              onClick={() => {
                onSections([
                  ...sections,
                  {
                    id: nextId('section'),
                    title: '',
                    displayOrder: sections.length,
                    lessons: [],
                  },
                ]);
              }}
            >
              <Plus aria-hidden="true" /> Add Section
            </Button>
          </ShakeOnAttempt>
          <RequiredMessage invalid={sections.length === 0}>
            Add at least one section.
          </RequiredMessage>
        </div>
      </div>
    </div>
  );
};
