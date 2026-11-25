import { useState, type ReactElement } from 'react';
import { Trash2 } from 'lucide-react';
import { Button, TextField, Select } from '@shared/ui';
import { cn, isValidHttpUrl } from '@shared/utils';
import {
  LESSON_KINDS,
  type Lesson,
  type LessonKind,
  type Section,
} from './upload-content-types';
import type { StudioSelection } from './CourseStudioStep';
import { QuizBuilder } from './QuizBuilder';
import { LessonMediaArea } from './LessonMediaArea';
import { AssignmentBriefArea } from './AssignmentBriefArea';
import { formatLessonDisplay } from './curriculum-display';
import { resolveLessonTypeMeta } from './lesson-type-meta';
import { useSubmitAttempt } from './submit-attempt-context';
import styles from './CourseStudioStep.module.css';

export interface LessonEditorPanelProps {
  readonly lesson: Lesson;
  readonly sIndex: number;
  readonly lIndex: number;
  readonly sectionId: string;
  readonly sections: readonly Section[];
  readonly onSections: (sections: readonly Section[]) => void;
  readonly setSelection: (s: StudioSelection) => void;
}

const resolveTitleError = (title: string, isFlagged: boolean): string | undefined => {
  if (!isFlagged) return undefined;
  if (title.trim().length === 0) return 'Lesson title is required.';
  if (title.length > 300) return 'Lesson title must not exceed 300 characters.';
  return undefined;
};

const resolveUrlError = (
  url: string | undefined,
  isFlagged: boolean,
): string | undefined => {
  if (!isFlagged) return undefined;
  const trimmed = (url ?? '').trim();
  if (trimmed.length === 0) return 'External URL is required for link lessons.';
  if (trimmed.length > 1000) return 'External URL must not exceed 1000 characters.';
  if (!isValidHttpUrl(trimmed)) {
    return 'Please enter a valid URL starting with http:// or https://';
  }
  return undefined;
};

const LessonLinkField = ({
  lesson,
  updateLesson,
}: {
  readonly lesson: Lesson;
  readonly updateLesson: (l: Lesson) => void;
}): ReactElement => {
  const [touched, setTouched] = useState(false);
  const attempted = useSubmitAttempt() > 0;
  const urlError = resolveUrlError(lesson.externalUrl, touched || attempted);

  return (
    <div style={{ marginTop: '1rem' }}>
      <TextField
        label="External Resource URL"
        placeholder="https://example.com/resource"
        type="url"
        value={lesson.externalUrl ?? ''}
        maxChars={1000}
        required
        error={urlError}
        onChange={(e) => {
          setTouched(true);
          updateLesson({ ...lesson, externalUrl: e.target.value });
        }}
      />
    </div>
  );
};

const LessonDetailsForm = ({
  lesson,
  lIndex,
  updateLesson,
}: {
  readonly lesson: Lesson;
  readonly lIndex: number;
  readonly updateLesson: (l: Lesson) => void;
}): ReactElement => {
  const [touched, setTouched] = useState(false);
  const attempted = useSubmitAttempt() > 0;
  const titleError = resolveTitleError(lesson.title, touched || attempted);
  const lessonDisplay = formatLessonDisplay(lesson.title, lIndex);

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ flex: 2 }}>
          <TextField
            label="Lesson Title"
            placeholder="e.g. Overview & Learning Objectives"
            value={lesson.title}
            maxChars={300}
            required
            error={titleError}
            onChange={(e) => {
              setTouched(true);
              updateLesson({ ...lesson, title: e.target.value });
            }}
          />
          <div className={styles.studioLearnerPreviewHint}>
            <span className={styles.previewHintLabel}>Learner preview:</span>
            <span
              className={cn(
                styles.previewHintValue,
                lessonDisplay.isUntitled && styles.previewHintUntitled,
              )}
            >
              {lessonDisplay.displayTitle}
            </span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <Select
            label="Content Type"
            value={lesson.kind}
            onChange={(value) => {
              const { file: _file, ...rest } = lesson;
              updateLesson({
                ...rest,
                kind: value as LessonKind,
              });
            }}
            options={LESSON_KINDS.map((kind) => ({
              value: kind,
              label: resolveLessonTypeMeta(kind).label,
            }))}
          />
        </div>
      </div>
      {lesson.kind === 'link' ? (
        <LessonLinkField lesson={lesson} updateLesson={updateLesson} />
      ) : null}
    </div>
  );
};

export const LessonEditorPanel = ({
  lesson,
  sIndex,
  lIndex,
  sectionId,
  sections,
  onSections,
  setSelection,
}: LessonEditorPanelProps): ReactElement => {
  const updateLesson = (updatedLesson: Lesson): void => {
    onSections(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              lessons: s.lessons.map((l) =>
                l.id === updatedLesson.id ? updatedLesson : l,
              ),
            }
          : s,
      ),
    );
  };

  const deleteLesson = (): void => {
    onSections(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, lessons: s.lessons.filter((l) => l.id !== lesson.id) }
          : s,
      ),
    );
    setSelection({ type: 'section', sectionId });
  };

  const lessonDisplay = formatLessonDisplay(lesson.title, lIndex);

  return (
    <div className={styles.studioEditorPanel}>
      <h2 className={styles.studioEditorTitle}>{lessonDisplay.ordinalLabel} Details</h2>
      <p className={styles.studioHint}>
        Section {String(sIndex + 1)} &middot; Configure lesson title, content type, and
        media.
      </p>
      <LessonDetailsForm
        key={lesson.id}
        lesson={lesson}
        lIndex={lIndex}
        updateLesson={updateLesson}
      />

      {lesson.kind === 'quiz' ? (
        <QuizBuilder lesson={lesson} updateLesson={updateLesson} />
      ) : lesson.kind === 'assignment' ? (
        <AssignmentBriefArea lesson={lesson} updateLesson={updateLesson} />
      ) : (
        <LessonMediaArea lesson={lesson} updateLesson={updateLesson} />
      )}

      <div style={{ marginTop: '2rem' }}>
        <Button variant="destructive" onClick={deleteLesson}>
          <Trash2 size={16} /> Delete Lesson
        </Button>
      </div>
    </div>
  );
};
