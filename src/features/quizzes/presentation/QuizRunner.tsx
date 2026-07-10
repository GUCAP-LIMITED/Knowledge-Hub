import { useState, type ReactElement } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@shared/ui';
import { cn } from '@shared/utils';
import type { Quiz, QuizAnswers } from '../domain';
import styles from './QuizSection.module.css';

export interface QuizRunnerProps {
  readonly quiz: Quiz;
  readonly isSubmitting: boolean;
  readonly onSubmit: (answers: QuizAnswers) => void;
}

const toggle = (list: readonly number[], index: number): readonly number[] =>
  list.includes(index) ? list.filter((i) => i !== index) : [...list, index];

/** Learner-facing quiz form: one card per question, multi-select answers, gated submit. */
export const QuizRunner = ({
  quiz,
  isSubmitting,
  onSubmit,
}: QuizRunnerProps): ReactElement => {
  const [answers, setAnswers] = useState<Record<string, readonly number[]>>({});
  const answered = quiz.questions.filter((q) => (answers[q.id]?.length ?? 0) > 0).length;
  const allAnswered = answered === quiz.questionCount;

  return (
    <div className={styles.runner}>
      <p className={styles.runnerMeta}>
        {quiz.questionCount} questions · {quiz.passMark}% to pass · select all that apply
      </p>
      {quiz.questions.map((question, index) => (
        <fieldset key={question.id} className={styles.question}>
          <legend className={styles.questionPrompt}>
            {index + 1}. {question.prompt}
          </legend>
          <div className={styles.options}>
            {question.options.map((option, optionIndex) => {
              const checked = (answers[question.id] ?? []).includes(optionIndex);
              return (
                <label
                  key={option}
                  className={cn(styles.option, checked && styles.optionSelected)}
                >
                  <span className={cn(styles.optionBox, checked && styles.optionBoxOn)}>
                    {checked ? <Check size={13} aria-hidden /> : null}
                  </span>
                  <input
                    type="checkbox"
                    className={styles.optionInput}
                    checked={checked}
                    onChange={() => {
                      setAnswers((prev) => ({
                        ...prev,
                        [question.id]: toggle(prev[question.id] ?? [], optionIndex),
                      }));
                    }}
                  />
                  <span>{option}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
      <div className={styles.runnerFoot}>
        <span className={styles.runnerProgress}>
          {answered}/{quiz.questionCount} answered
        </span>
        <Button
          variant="accent"
          disabled={!allAnswered || isSubmitting}
          isLoading={isSubmitting}
          onClick={() => {
            onSubmit(answers);
          }}
        >
          Submit answers
        </Button>
      </div>
    </div>
  );
};
