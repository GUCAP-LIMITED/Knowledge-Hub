import type { ReactElement } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { Button, IconButton, Select, TextField } from '@shared/ui';
import {
  LESSON_KINDS,
  type Lesson,
  type LessonKind,
  type Section,
  moveInArray,
  nextId,
} from './upload-content-types';
import styles from './UploadPage.module.css';

const MoveControls = ({
  canUp,
  canDown,
  label,
  onMove,
}: {
  readonly canUp: boolean;
  readonly canDown: boolean;
  readonly label: string;
  readonly onMove: (delta: number) => void;
}): ReactElement => (
  <>
    <IconButton
      label={`Move ${label} up`}
      disabled={!canUp}
      onClick={() => {
        onMove(-1);
      }}
    >
      <ChevronUp size={16} />
    </IconButton>
    <IconButton
      label={`Move ${label} down`}
      disabled={!canDown}
      onClick={() => {
        onMove(1);
      }}
    >
      <ChevronDown size={16} />
    </IconButton>
  </>
);

const LessonRow = ({
  lesson,
  index,
  total,
  onChange,
  onMove,
  onRemove,
}: {
  readonly lesson: Lesson;
  readonly index: number;
  readonly total: number;
  readonly onChange: (lesson: Lesson) => void;
  readonly onMove: (delta: number) => void;
  readonly onRemove: () => void;
}): ReactElement => (
  <div className={styles.lessonRow}>
    <TextField
      label="Lesson"
      placeholder="Lesson title…"
      value={lesson.title}
      onChange={(event) => {
        onChange({ ...lesson, title: event.target.value });
      }}
    />
    <Select
      label="Type"
      value={lesson.kind}
      onChange={(event) => {
        onChange({ ...lesson, kind: event.target.value as LessonKind });
      }}
    >
      {LESSON_KINDS.map((kind) => (
        <option key={kind} value={kind}>
          {kind}
        </option>
      ))}
    </Select>
    <div className={styles.rowActions}>
      <MoveControls
        canUp={index > 0}
        canDown={index < total - 1}
        label="lesson"
        onMove={onMove}
      />
      <IconButton label="Remove lesson" variant="danger" onClick={onRemove}>
        <Trash2 size={16} />
      </IconButton>
    </div>
  </div>
);

const SectionCard = ({
  section,
  index,
  total,
  onChange,
  onMove,
  onRemove,
}: {
  readonly section: Section;
  readonly index: number;
  readonly total: number;
  readonly onChange: (section: Section) => void;
  readonly onMove: (delta: number) => void;
  readonly onRemove: () => void;
}): ReactElement => {
  const setLessons = (lessons: readonly Lesson[]): void => {
    onChange({ ...section, lessons });
  };
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHead}>
        <span className={styles.sectionIndex}>{index + 1}</span>
        <TextField
          label="Section"
          placeholder="Section title…"
          value={section.title}
          onChange={(event) => {
            onChange({ ...section, title: event.target.value });
          }}
        />
        <div className={styles.rowActions}>
          <MoveControls
            canUp={index > 0}
            canDown={index < total - 1}
            label="section"
            onMove={onMove}
          />
          <IconButton label="Remove section" variant="danger" onClick={onRemove}>
            <Trash2 size={16} />
          </IconButton>
        </div>
      </div>
      {section.lessons.map((lesson, lessonIndex) => (
        <LessonRow
          key={lesson.id}
          lesson={lesson}
          index={lessonIndex}
          total={section.lessons.length}
          onChange={(next) => {
            setLessons(section.lessons.map((l) => (l.id === lesson.id ? next : l)));
          }}
          onMove={(delta) => {
            setLessons(moveInArray(section.lessons, lessonIndex, delta));
          }}
          onRemove={() => {
            setLessons(section.lessons.filter((l) => l.id !== lesson.id));
          }}
        />
      ))}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          setLessons([
            ...section.lessons,
            { id: nextId('lesson'), title: '', kind: 'video' },
          ]);
        }}
      >
        <Plus size={14} aria-hidden="true" /> Add lesson
      </Button>
    </div>
  );
};

export interface UploadCurriculumStepProps {
  readonly sections: readonly Section[];
  readonly onChange: (sections: readonly Section[]) => void;
}

/** Course curriculum builder — reorderable sections each holding reorderable lessons. */
export const UploadCurriculumStep = ({
  sections,
  onChange,
}: UploadCurriculumStepProps): ReactElement => (
  <div className={styles.curriculum}>
    {sections.length === 0 ? (
      <p className={styles.curriculumEmpty}>
        Add your first section, then add lessons to it.
      </p>
    ) : null}
    {sections.map((section, index) => (
      <SectionCard
        key={section.id}
        section={section}
        index={index}
        total={sections.length}
        onChange={(next) => {
          onChange(sections.map((s) => (s.id === section.id ? next : s)));
        }}
        onMove={(delta) => {
          onChange(moveInArray(sections, index, delta));
        }}
        onRemove={() => {
          onChange(sections.filter((s) => s.id !== section.id));
        }}
      />
    ))}
    <Button
      variant="secondary"
      onClick={() => {
        onChange([...sections, { id: nextId('section'), title: '', lessons: [] }]);
      }}
    >
      <Plus size={16} aria-hidden="true" /> Add section
    </Button>
  </div>
);
