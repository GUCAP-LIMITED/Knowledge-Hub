import { useState, type ReactElement } from 'react';
import { Button } from '@shared/ui';
import { cn } from '@shared/utils';
import type { Quiz, QuizAnswers } from '../domain';
import styles from './QuizSection.module.css';

export interface QuizRunnerProps {
  readonly quiz: Quiz;
  readonly isSubmitting: boolean;
  readonly onSubmit: (answers: QuizAnswers) => void;
}

/** Learner-facing quiz form: one card per question, single-choice options, gated submit. */
export const QuizRunner = ({
  quiz,
  isSubmitting,
  onSubmit,
}: QuizRunnerProps): ReactElement => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const answered = Object.keys(answers).length;
  const allAnswered = answered === quiz.questionCount;

  return (
    <div className={styles.runner}>
      <p className={styles.runnerMeta}>
        {quiz.questionCount} questions · {quiz.passMark}% to pass
      </p>
      {quiz.questions.map((question, index) => (
        <fieldset key={question.id} className={styles.question}>
          <legend className={styles.questionPrompt}>
            {index + 1}. {question.prompt}
          </legend>
          <div className={styles.options}>
            {question.options.map((option, optionIndex) => (
              <label
                key={option}
                className={cn(
                  styles.option,
                  answers[question.id] === optionIndex && styles.optionSelected,
                )}
              >
                <input
                  type="radio"
                  name={question.id}
                  checked={answers[question.id] === optionIndex}
                  onChange={() => {
                    setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }));
                  }}
                />
                <span>{option}</span>
              </label>
            ))}
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
