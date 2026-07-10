import type { ReactElement } from 'react';
import { Trash2 } from 'lucide-react';
import { IconButton } from '@shared/ui';
import { type DraftQuestion, PROMPT_MAX } from './quiz-draft';
import { QuizAnswerList } from './QuizAnswerList';
import styles from './QuizSection.module.css';

export type QuestionUpdater = (question: DraftQuestion) => DraftQuestion;

export interface QuizQuestionEditorProps {
  readonly index: number;
  readonly question: DraftQuestion;
  readonly canRemove: boolean;
  readonly onChange: (updater: QuestionUpdater) => void;
  readonly onRemove: () => void;
}

/** Modern authoring card for one question: counted prompt + checkable, editable answers. */
export const QuizQuestionEditor = ({
  index,
  question,
  canRemove,
  onChange,
  onRemove,
}: QuizQuestionEditorProps): ReactElement => (
  <div className={styles.editorCard}>
    <div className={styles.editorHead}>
      <span className={styles.editorNo}>Question {index + 1}</span>
      <span className={styles.editorCount}>
        {question.prompt.length}/{PROMPT_MAX}
      </span>
      {canRemove ? (
        <IconButton label="Remove question" variant="danger" onClick={onRemove}>
          <Trash2 size={15} aria-hidden />
        </IconButton>
      ) : null}
    </div>
    <input
      className={styles.editorPrompt}
      value={question.prompt}
      maxLength={PROMPT_MAX}
      placeholder="Write question"
      onChange={(event) => {
        const prompt = event.target.value;
        onChange((q) => ({ ...q, prompt }));
      }}
    />
    <p className={styles.editorHint}>Check the correct answers (multiple allowed)</p>
    <QuizAnswerList question={question} onChange={onChange} />
  </div>
);
