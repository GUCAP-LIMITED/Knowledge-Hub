import { useState, type ReactElement } from 'react';
import { Button } from '@shared/ui';
import {
  type Quiz,
  type QuizContentKind,
  type QuizProps,
  quizPropsError,
} from '../domain';
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
  const props = draftToProps(draft, existing, contentId, contentKind);
  const issue = quizPropsError(props);
  return (
    <div className={styles.build}>
      <QuizBuilderBody draft={draft} setDraft={setDraft} />
      <div className={styles.buildFoot}>
        {issue !== null ? <span className={styles.buildHint}>{issue}</span> : <span />}
        <div className={styles.buildActions}>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="accent"
            isLoading={isSaving}
            disabled={issue !== null}
            onClick={() => {
              onSave(props);
            }}
          >
            Save quiz
          </Button>
        </div>
      </div>
    </div>
  );
};
