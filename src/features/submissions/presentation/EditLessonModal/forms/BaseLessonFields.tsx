import type { ReactElement } from 'react';
import { TextField, Toggle, DurationInput } from '@shared/ui';
import { LESSON_KIND } from '@features/content';
import type { EditableLesson } from '../../types';

export interface BaseLessonFieldsProps {
  readonly draft: Partial<EditableLesson>;
  readonly setDraft: (
    updater: (prev: Partial<EditableLesson>) => Partial<EditableLesson>,
  ) => void;
  readonly showDuration?: boolean | undefined;
}

const isNoDurationKind = (kind?: number): boolean =>
  kind === LESSON_KIND.pdf || kind === LESSON_KIND.quiz || kind === LESSON_KIND.link;

export const BaseLessonFields = ({
  draft,
  setDraft,
  showDuration,
}: BaseLessonFieldsProps): ReactElement => {
  const title = draft.title ?? '';
  const titleTrimmed = title.trim();
  const titleError =
    titleTrimmed.length === 0
      ? 'Lesson title is required.'
      : title.length > 300
        ? 'Lesson title must not exceed 300 characters.'
        : undefined;

  const duration = draft.durationSeconds ?? 0;
  const durationError = duration < 0 ? 'Duration cannot be negative.' : undefined;
  const shouldShowDuration = showDuration ?? !isNoDurationKind(draft.kind);

  return (
    <>
      <TextField
        label="Lesson Title"
        required
        maxChars={300}
        value={title}
        error={titleError}
        onChange={(e) => {
          const val = e.target.value;
          setDraft((d) => ({ ...d, title: val }));
        }}
      />
      {shouldShowDuration && (
        <DurationInput
          label="Duration"
          mode="seconds"
          value={duration}
          error={durationError}
          onChange={(_val, totalSeconds) => {
            setDraft((d) => ({ ...d, durationSeconds: totalSeconds }));
          }}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Toggle
          checked={draft.isPreview ?? false}
          onChange={(val: boolean) => {
            setDraft((d) => ({ ...d, isPreview: val }));
          }}
          label="Available as Free Preview"
        />
      </div>
    </>
  );
};
