import type { ReactElement } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, IconButton, Select, TextField } from '@shared/ui';
import {
  LESSON_KINDS,
  type Lesson,
  type LessonKind,
  type Section,
  nextId,
} from './upload-content-types';
import styles from './UploadPage.module.css';

const LessonRow = ({
  lesson,
  onChange,
  onRemove,
}: {
  readonly lesson: Lesson;
  readonly onChange: (lesson: Lesson) => void;
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
    <IconButton label="Remove lesson" variant="danger" onClick={onRemove}>
      <Trash2 size={16} />
    </IconButton>
  </div>
);

const SectionCard = ({
  section,
  index,
  onChange,
  onRemove,
}: {
  readonly section: Section;
  readonly index: number;
  readonly onChange: (section: Section) => void;
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
        <IconButton label="Remove section" variant="danger" onClick={onRemove}>
          <Trash2 size={16} />
        </IconButton>
      </div>
      {section.lessons.map((lesson) => (
        <LessonRow
          key={lesson.id}
          lesson={lesson}
          onChange={(next) => {
            setLessons(section.lessons.map((l) => (l.id === lesson.id ? next : l)));
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

/** Course curriculum builder — sections each holding ordered lessons. */
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
        onChange={(next) => {
          onChange(sections.map((s) => (s.id === section.id ? next : s)));
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
