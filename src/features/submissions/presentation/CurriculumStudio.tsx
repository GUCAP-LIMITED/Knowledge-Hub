/* eslint-disable max-lines, max-lines-per-function, complexity, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-confusing-void-expression */
import { useState, type ReactElement } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from '@shared/ui';
import { generateGuid } from '@shared/utils';
import { useMyCapabilities } from '@features/users';
import { useDraftEditor } from './use-draft-editor';
import { type EditableSection, type EditableLesson } from './types';
import { EditSectionModal } from './EditSectionModal';
import { EditLessonModal } from './EditLessonModal';
import { LessonPreviewModal } from './LessonPreviewModal';
import { SortableSection } from './SortableSection';
import styles from './EditSubmissionPage.module.css';

// ── Components ──

// Modals imported externally

export interface CurriculumStudioProps {
  readonly readOnly?: boolean | undefined;
}

export const CurriculumStudio = ({
  readOnly = false,
}: CurriculumStudioProps): ReactElement => {
  const { draftState, updateCurriculum, contentId, canModify } = useDraftEditor();
  const { can } = useMyCapabilities();
  const canEdit = !readOnly && can('submissions', 'edit') && canModify;
  const canDelete = !readOnly && can('submissions', 'delete') && canModify;
  // Safely cast or map the DTO sections to EditableSection format for the UI
  const sections: EditableSection[] = (draftState.curriculum?.sections ?? []).map(
    (s, sIdx) => ({
      id: s.id,
      title: s.title,
      displayOrder: s.displayOrder ?? sIdx,
      lessons: s.lessons.map((l, lIdx) => ({
        id: l.id,
        title: l.title,
        kind: l.kind,
        displayOrder: l.displayOrder ?? lIdx,
        mediaAssetId: l.mediaAssetId,
        externalUrl: l.externalUrl,
        quizId: l.quizId ?? null,
        durationSeconds: l.durationSeconds,
        isPreview: l.isPreview,
        media: l.media ?? null,
        quiz: l.quiz ?? null,
        assignmentFiles: l.assignmentFiles ? [...l.assignmentFiles] : null,
      })),
    }),
  );

  const setSections = (
    updater: EditableSection[] | ((prev: EditableSection[]) => EditableSection[]),
  ) => {
    const nextSections = typeof updater === 'function' ? updater(sections) : updater;
    updateCurriculum({
      sections: nextSections.map((s: EditableSection) => ({
        id: s.id,
        title: s.title,
        displayOrder: s.displayOrder,
        lessons: s.lessons.map((l: EditableLesson) => ({
          id: l.id,
          title: l.title,
          kind: l.kind,
          displayOrder: l.displayOrder,
          mediaAssetId: l.mediaAssetId,
          externalUrl: l.externalUrl,
          quizId: l.quizId,
          durationSeconds: l.durationSeconds,
          isPreview: l.isPreview,
          media: l.media ?? null,
          quiz: l.quiz ?? null,
          assignmentFiles: l.assignmentFiles ?? null,
        })),
      })),
    });
  };

  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [previewingLessonId, setPreviewingLessonId] = useState<string | null>(null);

  const activeEditingSection = sections.find((s) => s.id === editingSectionId) ?? null;
  const getLessonById = (id: string) => {
    for (const s of sections) {
      const l = s.lessons.find((l: any) => l.id === id);
      if (l) return l;
    }
    return null;
  };
  const activeEditingLesson = getLessonById(editingLessonId ?? '');
  const activePreviewingLesson = getLessonById(previewingLessonId ?? '');
  const activePreviewingSection =
    sections.find((s) => s.lessons.some((l) => l.id === previewingLessonId)) ?? null;

  // We can track active drag state here if we need special visual overlays

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = () => {
    // setActiveId(event.active.id);
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    if (active.data.current?.type === 'Lesson' && over.data.current?.type === 'Lesson') {
      const activeLessonId = active.id;
      const overLessonId = over.id;

      // Find containers
      const activeSection = sections.find((s) =>
        s.lessons.some((l) => l.id === activeLessonId),
      );
      const overSection = sections.find((s) =>
        s.lessons.some((l) => l.id === overLessonId),
      );

      if (!activeSection || !overSection || activeSection.id === overSection.id) {
        return; // Same container handled by dragEnd
      }

      setSections((prev) => {
        const activeSIdx = prev.findIndex((s) => s.id === activeSection.id);
        const overSIdx = prev.findIndex((s) => s.id === overSection.id);
        const activeSectionData = prev[activeSIdx];
        const overSectionData = prev[overSIdx];
        if (!activeSectionData || !overSectionData) return prev;

        const activeLIdx = activeSectionData.lessons.findIndex(
          (l) => l.id === activeLessonId,
        );
        const overLIdx = overSectionData.lessons.findIndex((l) => l.id === overLessonId);

        const newSections = [...prev];

        const lesson = activeSectionData.lessons[activeLIdx];
        if (!lesson) return prev;

        const updatedActiveLessons = activeSectionData.lessons
          .filter((l) => l.id !== activeLessonId)
          .map((les, idx) => ({ ...les, displayOrder: idx }));

        const newOverLessons = [...overSectionData.lessons];
        newOverLessons.splice(overLIdx, 0, lesson);
        const updatedOverLessons = newOverLessons.map((les, idx) => ({
          ...les,
          displayOrder: idx,
        }));

        newSections[activeSIdx] = {
          ...activeSectionData,
          lessons: updatedActiveLessons,
        };
        newSections[overSIdx] = {
          ...overSectionData,
          lessons: updatedOverLessons,
        };

        return newSections;
      });
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) return;

    if (
      active.data.current?.type === 'Section' &&
      over.data.current?.type === 'Section'
    ) {
      if (active.id !== over.id) {
        setSections((items) => {
          const oldIndex = items.findIndex((s) => s.id === active.id);
          const newIndex = items.findIndex((s) => s.id === over.id);
          const moved = arrayMove(items, oldIndex, newIndex);
          return moved.map((sec, idx) => ({ ...sec, displayOrder: idx }));
        });
      }
    } else if (active.data.current?.type === 'Lesson') {
      const activeLessonId = active.id;
      const overId = over.id;

      const activeSection = sections.find((s) =>
        s.lessons.some((l) => l.id === activeLessonId),
      );
      if (!activeSection) return;

      const overSection =
        over.data.current?.type === 'Section'
          ? sections.find((s) => s.id === overId)
          : sections.find((s) => s.lessons.some((l) => l.id === overId));

      if (!overSection) return;

      if (activeSection.id === overSection.id) {
        // Reordering within the same section
        const oldIndex = activeSection.lessons.findIndex((l) => l.id === activeLessonId);
        const newIndex = activeSection.lessons.findIndex((l) => l.id === overId);
        if (oldIndex !== newIndex) {
          setSections((prev) =>
            prev.map((s) => {
              if (s.id === activeSection.id) {
                const moved = arrayMove(s.lessons, oldIndex, newIndex);
                return {
                  ...s,
                  lessons: moved.map((les, idx) => ({ ...les, displayOrder: idx })),
                };
              }
              return s;
            }),
          );
        }
      } else {
        // Moving to empty section (handled if we dropped over a section directly)
        setSections((prev) => {
          const activeSIdx = prev.findIndex((s) => s.id === activeSection.id);
          const overSIdx = prev.findIndex((s) => s.id === overSection.id);
          const activeSectionData = prev[activeSIdx];
          const overSectionData = prev[overSIdx];
          if (!activeSectionData || !overSectionData) return prev;

          const activeLIdx = activeSectionData.lessons.findIndex(
            (l) => l.id === activeLessonId,
          );

          const newSections = [...prev];

          const lesson = activeSectionData.lessons[activeLIdx];
          if (!lesson) return prev;

          const updatedActiveLessons = activeSectionData.lessons
            .filter((l) => l.id !== activeLessonId)
            .map((les, idx) => ({ ...les, displayOrder: idx }));

          const updatedOverLessons = [...overSectionData.lessons, lesson].map(
            (les, idx) => ({
              ...les,
              displayOrder: idx,
            }),
          );

          newSections[activeSIdx] = {
            ...activeSectionData,
            lessons: updatedActiveLessons,
          };
          newSections[overSIdx] = {
            ...overSectionData,
            lessons: updatedOverLessons,
          };
          return newSections;
        });
      }
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
            Curriculum Structure
          </h2>
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSections((s) => [
                  ...s,
                  {
                    id: generateGuid(),
                    title: 'New Section',
                    displayOrder: s.length,
                    lessons: [],
                  },
                ]);
              }}
            >
              + Add Section
            </Button>
          )}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className={styles.curriculumList}>
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  readOnly={readOnly}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  onRemoveSection={() => {
                    setSections((s) =>
                      s
                        .filter((x) => x.id !== section.id)
                        .map((sec, idx) => ({ ...sec, displayOrder: idx })),
                    );
                  }}
                  onEditSection={() => setEditingSectionId(section.id)}
                  onEditLesson={(lessonId) => setEditingLessonId(lessonId)}
                  onPreviewLesson={(lessonId) => setPreviewingLessonId(lessonId)}
                  onAddLesson={() => {
                    setSections((prev) =>
                      prev.map((s) => {
                        if (s.id === section.id) {
                          return {
                            ...s,
                            lessons: [
                              ...s.lessons,
                              {
                                id: generateGuid(),
                                title: 'New Lesson',
                                kind: 0,
                                durationSeconds: 0,
                                displayOrder: s.lessons.length,
                                isPreview: false,
                                mediaAssetId: null,
                                externalUrl: null,
                                quizId: null,
                              },
                            ],
                          };
                        }
                        return s;
                      }),
                    );
                  }}
                  onRemoveLesson={(lessonId) => {
                    setSections((prev) =>
                      prev.map((s) => {
                        if (s.id === section.id) {
                          return {
                            ...s,
                            lessons: s.lessons
                              .filter((l) => l.id !== lessonId)
                              .map((les, idx) => ({ ...les, displayOrder: idx })),
                          };
                        }
                        return s;
                      }),
                    );
                  }}
                />
              ))}
            </SortableContext>
          </div>

          <DragOverlay
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: { active: { opacity: '0.4' } },
              }),
            }}
          >
            {/* Active item visual can go here */}
          </DragOverlay>
        </DndContext>

        <EditSectionModal
          open={editingSectionId !== null}
          section={activeEditingSection}
          onClose={() => setEditingSectionId(null)}
          onSave={(title) => {
            setSections((prev) =>
              prev.map((s) => (s.id === editingSectionId ? { ...s, title } : s)),
            );
          }}
        />

        <EditLessonModal
          open={editingLessonId !== null}
          lesson={activeEditingLesson}
          onClose={() => setEditingLessonId(null)}
          onSave={(updated) => {
            setSections((prev) =>
              prev.map((s) => ({
                ...s,
                lessons: s.lessons.map((l) =>
                  l.id === editingLessonId ? { ...l, ...updated } : l,
                ),
              })),
            );
          }}
        />

        <LessonPreviewModal
          open={previewingLessonId !== null}
          lesson={activePreviewingLesson}
          contentId={contentId}
          sectionTitle={activePreviewingSection?.title}
          onClose={() => setPreviewingLessonId(null)}
        />
      </div>
    </div>
  );
};
