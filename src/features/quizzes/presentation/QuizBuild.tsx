import { useState, type ReactElement } from 'react';
import { Button } from '@shared/ui';
import type { Quiz, QuizContentKind, QuizProps } from '../domain';
import { QuizBuilderBody } from './QuizBuilderBody';
import { draftFromQuiz, draftToProps } from './quiz-draft';
import styles from './QuizSection.module.css';

export interface QuizBuildProps {
  readonly existing: Quiz | null;
  readonly contentId: string;
  readonly contentKind: QuizContentKind;
  readonly isSaving: boolean;
  readonly onCancel: () => void;
  readonly onSave: (props: QuizProps) => void;
}

/** Inline authoring view: builds/edits one quiz's title, pass mark and questions. */
export const QuizBuild = ({
  existing,
  contentId,
  contentKind,
  isSaving,
  onCancel,
  onSave,
}: QuizBuildProps): ReactElement => {
  const [draft, setDraft] = useState(() => draftFromQuiz(existing));
  return (
    <div className={styles.build}>
      <QuizBuilderBody draft={draft} setDraft={setDraft} />
      <div className={styles.buildFoot}>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="accent"
          isLoading={isSaving}
          onClick={() => {
            onSave(draftToProps(draft, existing, contentId, contentKind));
          }}
        >
          Save quiz
        </Button>
      </div>
    </div>
  );
};
