/* eslint-disable max-lines-per-function */
import {
  useState,
  useEffect,
  type ReactElement,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { Button, Modal, Select } from '@shared/ui';
import { isValidHttpUrl } from '@shared/utils';
import { LESSON_KIND } from '@features/content';
import type { EditableLesson } from '../types';
import { missingQuiz } from '../upload-content-types';
import { VideoLessonForm } from './forms/VideoLessonForm';
import { DocumentLessonForm } from './forms/DocumentLessonForm';
import { QuizLessonForm } from './forms/QuizLessonForm';
import { AssignmentLessonForm } from './forms/AssignmentLessonForm';
import { LinkLessonForm } from './forms/LinkLessonForm';

const KIND_OPTIONS = [
  { value: String(LESSON_KIND.video), label: 'Video' },
  { value: String(LESSON_KIND.pdf), label: 'Document' },
  { value: String(LESSON_KIND.quiz), label: 'Quiz' },
  { value: String(LESSON_KIND.assignment), label: 'Assignment' },
  { value: String(LESSON_KIND.link), label: 'Link' },
];

interface LessonKindFormProps {
  readonly draft: Partial<EditableLesson>;
  readonly setDraft: Dispatch<SetStateAction<Partial<EditableLesson>>>;
}

const LessonKindForm = ({ draft, setDraft }: LessonKindFormProps): ReactElement => {
  switch (draft.kind) {
    case LESSON_KIND.video:
      return <VideoLessonForm draft={draft} setDraft={setDraft} />;
    case LESSON_KIND.pdf:
      return <DocumentLessonForm draft={draft} setDraft={setDraft} />;
    case LESSON_KIND.quiz:
      return <QuizLessonForm draft={draft} setDraft={setDraft} />;
    case LESSON_KIND.assignment:
      return <AssignmentLessonForm draft={draft} setDraft={setDraft} />;
    case LESSON_KIND.link:
      return <LinkLessonForm draft={draft} setDraft={setDraft} />;
    case undefined:
    default:
      return <VideoLessonForm draft={draft} setDraft={setDraft} />;
  }
};

const isNoDurationKind = (kind?: number): boolean =>
  kind === LESSON_KIND.pdf || kind === LESSON_KIND.quiz || kind === LESSON_KIND.link;

/** Type-specific fields (media, URL, quiz) don't carry meaning across a lesson-type switch —
 * e.g. a staged document file must not reappear as a "staged video" after switching to Video. */
const resetTypeSpecificFields = (
  draft: Partial<EditableLesson>,
  kind: number,
): Partial<EditableLesson> => ({
  ...draft,
  kind,
  durationSeconds: isNoDurationKind(kind) ? 0 : (draft.durationSeconds ?? 0),
  mediaAssetId: null,
  externalUrl: null,
  quizId: null,
  media: null,
  quiz: null,
  assignmentFiles: null,
});

const validateExternalUrl = (
  kind: number | undefined,
  externalUrl?: string | null,
): boolean => {
  const rawUrl = externalUrl?.trim() ?? '';
  if (kind === LESSON_KIND.link) {
    return rawUrl.length > 0 && rawUrl.length <= 1000 && isValidHttpUrl(rawUrl);
  }
  return rawUrl.length === 0 || (rawUrl.length <= 1000 && isValidHttpUrl(rawUrl));
};

const validateLessonDraft = (draft: Partial<EditableLesson>): boolean => {
  const title = (draft.title ?? '').trim();
  const isTitleValid = title.length > 0 && title.length <= 300;
  const isDurationValid = (draft.durationSeconds ?? 0) >= 0;
  if (
    !isTitleValid ||
    !isDurationValid ||
    !validateExternalUrl(draft.kind, draft.externalUrl)
  ) {
    return false;
  }
  if (draft.kind === LESSON_KIND.quiz && draft.quiz) {
    if (missingQuiz(draft.quiz).length > 0) {
      return false;
    }
  }
  return true;
};

export interface EditLessonModalProps {
  readonly lesson: EditableLesson | null;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSave: (updated: Partial<EditableLesson>) => void;
}

export const EditLessonModal = ({
  lesson,
  open,
  onClose,
  onSave,
}: EditLessonModalProps): ReactElement => {
  const [draft, setDraft] = useState<Partial<EditableLesson>>({});

  useEffect(() => {
    if (open && lesson) {
      setDraft(lesson);
    } else if (!open) {
      // Small delay to prevent visual flicker before the modal fully closes
      setTimeout(() => {
        setDraft({});
      }, 150);
    }
  }, [lesson, open]);

  const isValid = validateLessonDraft(draft);

  return (
    <Modal
      open={open}
      size="xl"
      onOpenChange={(val) => {
        if (!val) onClose();
      }}
      title="Edit Lesson"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          padding: '1rem 0',
        }}
      >
        <Select
          label="Lesson Type"
          options={KIND_OPTIONS}
          value={String(draft.kind ?? 0)}
          onChange={(val) => {
            const kind = Number(val);
            setDraft((d) => (d.kind === kind ? d : resetTypeSpecificFields(d, kind)));
          }}
        />

        {/* Render the specific form based on lesson kind */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <LessonKindForm draft={draft} setDraft={setDraft} />
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
          marginTop: '1rem',
        }}
      >
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="default"
          disabled={!isValid}
          onClick={() => {
            if (!isValid) return;
            const finalDraft = isNoDurationKind(draft.kind)
              ? { ...draft, durationSeconds: 0 }
              : draft;
            onSave(finalDraft);
            onClose();
            setDraft({});
          }}
        >
          Save
        </Button>
      </div>
    </Modal>
  );
};
