import { useState, type ReactElement } from 'react';
import { Trash2 } from 'lucide-react';
import { Button, TextField } from '@shared/ui';
import { cn } from '@shared/utils';
import type { Section, SlotFiles, UploadSlot } from './upload-content-types';
import { UploadFileStep } from './UploadFileStep';
import { StudioSidebar } from './CourseStudioSidebar';
import { LessonEditorPanel } from './LessonEditorPanel';
import { formatSectionDisplay } from './curriculum-display';
import { firstStudioIssue } from './curriculum-validation';
import { StudioIssueSummary } from './StudioIssueSummary';
import { useIsFlagged, useSubmitAttempt } from './submit-attempt-context';
import { requiredSlotsFilled } from './upload-content-types';
import { RequiredMessage } from './RequiredHint';
import styles from './CourseStudioStep.module.css';

export interface CourseStudioStepProps {
  readonly slots: readonly UploadSlot[];
  readonly files: SlotFiles;
  readonly onFiles: (files: SlotFiles) => void;
  readonly sections: readonly Section[];
  readonly onSections: (sections: readonly Section[]) => void;
}

export type StudioSelection =
  | { type: 'course' }
  | { type: 'section'; sectionId: string }
  | { type: 'lesson'; lessonId: string; sectionId: string };

const CourseEditorPanel = ({
  slots,
  files,
  onFiles,
}: {
  readonly slots: readonly UploadSlot[];
  readonly files: SlotFiles;
  readonly onFiles: (files: SlotFiles) => void;
}): ReactElement => (
  <div className={styles.studioEditorPanel}>
    <h2 className={styles.studioEditorTitle}>Course Media</h2>
    <p className={styles.studioHint}>
      Upload your course thumbnail and introductory video.
    </p>
    <UploadFileStep slots={slots} files={files} onChange={onFiles} />
  </div>
);

const SectionEditorPanel = ({
  section,
  sIndex,
  sections,
  onSections,
  setSelection,
}: {
  readonly section: Section;
  readonly sIndex: number;
  readonly sections: readonly Section[];
  readonly onSections: (sections: readonly Section[]) => void;
  readonly setSelection: (s: StudioSelection) => void;
}): ReactElement => {
  const updateSection = (updatedSection: Section): void => {
    onSections(sections.map((s) => (s.id === updatedSection.id ? updatedSection : s)));
  };

  const attempted = useSubmitAttempt() > 0;
  const titleError =
    section.title.length > 200
      ? 'Section title must not exceed 200 characters.'
      : attempted && section.title.trim().length === 0
        ? 'Section title is required.'
        : undefined;

  const sectionDisplay = formatSectionDisplay(section.title, sIndex);

  return (
    <div className={styles.studioEditorPanel}>
      <h2 className={styles.studioEditorTitle}>{sectionDisplay.ordinalLabel} Details</h2>
      <p className={styles.studioHint}>
        Give this section a descriptive title. The section number (
        {sectionDisplay.ordinalLabel}) is automatically prefixed for learners.
      </p>
      <TextField
        label="Section Title"
        placeholder="e.g. Introduction & Fundamentals"
        value={section.title}
        maxChars={200}
        required
        error={titleError}
        onChange={(e) => {
          updateSection({ ...section, title: e.target.value });
        }}
      />
      <div className={styles.studioLearnerPreviewHint}>
        <span className={styles.previewHintLabel}>Learner preview:</span>
        <span className={styles.previewHintValue}>
          {sectionDisplay.ordinalLabel}:{' '}
          <span className={cn(sectionDisplay.isUntitled && styles.previewHintUntitled)}>
            {sectionDisplay.displayTitle}
          </span>
        </span>
      </div>
      <RequiredMessage invalid={section.lessons.length === 0}>
        Add at least one lesson to this section from the outline.
      </RequiredMessage>
      <div style={{ marginTop: '2rem' }}>
        <Button
          variant="destructive"
          onClick={() => {
            onSections(sections.filter((s) => s.id !== section.id));
            setSelection({ type: 'course' });
          }}
        >
          <Trash2 size={16} /> Delete Section
        </Button>
      </div>
    </div>
  );
};

const StudioEditor = ({
  slots,
  files,
  onFiles,
  sections,
  onSections,
  selection,
  setSelection,
}: CourseStudioStepProps & {
  readonly selection: StudioSelection;
  readonly setSelection: (s: StudioSelection) => void;
}): ReactElement | null => {
  if (selection.type === 'course') {
    return <CourseEditorPanel slots={slots} files={files} onFiles={onFiles} />;
  }

  const sIndex = sections.findIndex((s) => s.id === selection.sectionId);
  const section = sections[sIndex];
  if (!section) return null;

  if (selection.type === 'section') {
    return (
      <SectionEditorPanel
        section={section}
        sIndex={sIndex}
        sections={sections}
        onSections={onSections}
        setSelection={setSelection}
      />
    );
  }

  const lIndex = section.lessons.findIndex((l) => l.id === selection.lessonId);
  const lesson = section.lessons[lIndex];
  if (!lesson) return null;

  return (
    <LessonEditorPanel
      lesson={lesson}
      sIndex={sIndex}
      lIndex={lIndex}
      sectionId={selection.sectionId}
      sections={sections}
      onSections={onSections}
      setSelection={setSelection}
    />
  );
};

export const CourseStudioStep = (props: CourseStudioStepProps): ReactElement => {
  const [selection, setSelection] = useState<StudioSelection>({ type: 'course' });
  const attempt = useSubmitAttempt();
  const courseFlagged = useIsFlagged(!requiredSlotsFilled('course', props.files));
  // Each blocked publish jumps to the first issue instead of leaving it in a hidden panel.
  const [handledAttempt, setHandledAttempt] = useState(attempt);
  if (attempt !== handledAttempt) {
    setHandledAttempt(attempt);
    const target = attempt > 0 ? firstStudioIssue(props.files, props.sections) : null;
    if (target !== null) setSelection(target);
  }

  return (
    <>
      <div className={styles.studioLayout}>
        <StudioSidebar
          sections={props.sections}
          onSections={props.onSections}
          selection={selection}
          setSelection={setSelection}
          courseFlagged={courseFlagged}
        />
        <div className={styles.studioEditor}>
          <StudioEditor {...props} selection={selection} setSelection={setSelection} />
        </div>
      </div>
      <StudioIssueSummary
        files={props.files}
        sections={props.sections}
        onSelect={setSelection}
      />
    </>
  );
};
