import type { ReactElement } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, IconButton, TextField } from '@shared/ui';
import type { DraftQuestion } from './quiz-draft';
import styles from './QuizSection.module.css';

export interface QuizQuestionEditorProps {
  readonly index: number;
  readonly question: DraftQuestion;
  readonly canRemove: boolean;
  readonly onChange: (question: DraftQuestion) => void;
  readonly onRemove: () => void;
}

/** Admin editor for a single question: prompt, its options, and which option is correct. */
export const QuizQuestionEditor = ({
  index,
  question,
  canRemove,
  onChange,
  onRemove,
}: QuizQuestionEditorProps): ReactElement => {
  const setOption = (optionIndex: number, value: string): void => {
    onChange({
      ...question,
      options: question.options.map((o, i) => (i === optionIndex ? value : o)),
    });
  };

  return (
    <div className={styles.editorCard}>
      <div className={styles.editorHead}>
        <span className={styles.editorNo}>Question {index + 1}</span>
        {canRemove ? (
          <IconButton label="Remove question" variant="danger" onClick={onRemove}>
            <Trash2 size={15} aria-hidden />
          </IconButton>
        ) : null}
      </div>
      <TextField
        label="Prompt"
        value={question.prompt}
        onChange={(event) => {
          onChange({ ...question, prompt: event.target.value });
        }}
      />
      <div className={styles.editorOptions}>
        {question.options.map((option, optionIndex) => (
          <label key={optionIndex} className={styles.editorOption}>
            <input
              type="radio"
              name={`correct-${question.id}`}
              checked={question.correctIndex === optionIndex}
              onChange={() => {
                onChange({ ...question, correctIndex: optionIndex });
              }}
              aria-label={`Mark option ${String(optionIndex + 1)} correct`}
            />
            <TextField
              label={`Option ${String(optionIndex + 1)}`}
              value={option}
              onChange={(event) => {
                setOption(optionIndex, event.target.value);
              }}
            />
          </label>
        ))}
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          onChange({ ...question, options: [...question.options, ''] });
        }}
      >
        <Plus size={15} aria-hidden /> Add option
      </Button>
    </div>
  );
};
