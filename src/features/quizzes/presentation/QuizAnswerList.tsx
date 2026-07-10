import type { ReactElement } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@shared/ui';
import type { DraftQuestion } from './quiz-draft';
import type { QuestionUpdater } from './QuizQuestionEditor';
import { QuizAnswerRow } from './QuizAnswerRow';
import styles from './QuizSection.module.css';

export interface QuizAnswerListProps {
  readonly question: DraftQuestion;
  readonly onChange: (updater: QuestionUpdater) => void;
}

/** The checkable, editable answer options of one question, plus an "add answer" control. */
export const QuizAnswerList = ({
  question,
  onChange,
}: QuizAnswerListProps): ReactElement => {
  const setOption = (i: number, value: string): void => {
    onChange((q) => ({
      ...q,
      options: q.options.map((o, j) => (j === i ? value : o)),
      // A blank option can't stay marked correct, or the marker is silently lost on save.
      correctIndexes:
        value.trim() === '' ? q.correctIndexes.filter((x) => x !== i) : q.correctIndexes,
    }));
  };

  const toggleCorrect = (i: number): void => {
    onChange((q) => {
      const isCorrect = q.correctIndexes.includes(i);
      // Guard: never mark an empty answer correct.
      if (!isCorrect && (q.options[i] ?? '').trim() === '') {
        return q;
      }
      return {
        ...q,
        correctIndexes: isCorrect
          ? q.correctIndexes.filter((x) => x !== i)
          : [...q.correctIndexes, i],
      };
    });
  };

  const removeOption = (i: number): void => {
    onChange((q) => ({
      ...q,
      options: q.options.filter((_, j) => j !== i),
      correctIndexes: q.correctIndexes
        .filter((x) => x !== i)
        .map((x) => (x > i ? x - 1 : x)),
    }));
  };

  return (
    <>
      <div className={styles.answers}>
        {question.options.map((option, i) => (
          <QuizAnswerRow
            key={i}
            index={i}
            value={option}
            correct={question.correctIndexes.includes(i)}
            canRemove={question.options.length > 2}
            onToggle={() => {
              toggleCorrect(i);
            }}
            onText={(value) => {
              setOption(i, value);
            }}
            onRemove={() => {
              removeOption(i);
            }}
          />
        ))}
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          onChange((q) => ({ ...q, options: [...q.options, ''] }));
        }}
      >
        <Plus size={15} aria-hidden /> Add answer
      </Button>
    </>
  );
};
