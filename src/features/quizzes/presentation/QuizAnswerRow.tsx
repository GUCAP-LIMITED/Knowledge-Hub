import type { ReactElement } from 'react';
import { Check, X } from 'lucide-react';
import { IconButton } from '@shared/ui';
import { cn } from '@shared/utils';
import styles from './QuizSection.module.css';

export interface QuizAnswerRowProps {
  readonly index: number;
  readonly value: string;
  readonly correct: boolean;
  readonly canRemove: boolean;
  readonly onToggle: () => void;
  readonly onText: (value: string) => void;
  readonly onRemove: () => void;
}

/** One answer option: a "mark correct" checkbox, an inline text field, and a remove control. */
export const QuizAnswerRow = ({
  index,
  value,
  correct,
  canRemove,
  onToggle,
  onText,
  onRemove,
}: QuizAnswerRowProps): ReactElement => (
  <div className={cn(styles.answerRow, correct && styles.answerRowCorrect)}>
    <button
      type="button"
      className={cn(styles.answerCheck, correct && styles.answerCheckOn)}
      aria-pressed={correct}
      aria-label={`Mark answer ${String(index + 1)} correct`}
      onClick={onToggle}
    >
      {correct ? <Check size={14} aria-hidden /> : null}
    </button>
    <input
      className={styles.answerInput}
      value={value}
      placeholder={`Answer ${String(index + 1)}`}
      onChange={(event) => {
        onText(event.target.value);
      }}
    />
    {canRemove ? (
      <IconButton
        label={`Remove answer ${String(index + 1)}`}
        variant="ghost"
        className={styles.answerRemove}
        onClick={onRemove}
      >
        <X size={14} aria-hidden />
      </IconButton>
    ) : null}
  </div>
);
