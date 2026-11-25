import { useState, type ReactElement } from 'react';
import type { Quiz, QuizAnswers, QuizResult } from '../domain';
import { QuizResultView } from './QuizResultView';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@shared/ui';
import { cn } from '@shared/utils';
import { motion, AnimatePresence } from 'motion/react';
import styles from './QuizSection.module.css';

const toggle = (list: readonly number[], index: number): readonly number[] =>
  list.includes(index) ? list.filter((i) => i !== index) : [...list, index];

const AnimatedCheck = (): ReactElement => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <motion.polyline
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.3, type: 'spring', bounce: 0 }}
      points="20 6 9 17 4 12"
    />
  </svg>
);

// eslint-disable-next-line max-lines-per-function
const QuizForm = ({
  quiz,
  isSubmitting,
  onSubmit,
}: {
  readonly quiz: Quiz;
  readonly isSubmitting: boolean;
  readonly onSubmit: (answers: QuizAnswers) => void;
}): ReactElement => {
  const [answers, setAnswers] = useState<Record<string, readonly number[]>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const answered = quiz.questions.filter((q) => (answers[q.id]?.length ?? 0) > 0).length;
  const allAnswered = answered === quiz.questionCount;

  const question = quiz.questions[currentIndex];

  const paginate = (newDirection: number): void => {
    setDirection(newDirection);
    setCurrentIndex((prev) => prev + newDirection);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className={styles.runner}>
      <div className={styles.runnerHeader}>
        <div className={styles.progressHeader}>
          <span className={styles.progressText}>
            Question {currentIndex + 1} of {quiz.questionCount}
          </span>
          <motion.span
            key={answered}
            initial={{ scale: 1.2, color: 'var(--color-primary)' }}
            animate={{ scale: 1, color: 'var(--color-text-subtle)' }}
            className={styles.progressPercentage}
          >
            {Math.round((answered / quiz.questionCount) * 100)}% Answered
          </motion.span>
        </div>
        <div className={styles.progressBarWrapper}>
          <div className={styles.progressBar}>
            <motion.div
              className={styles.progressFill}
              initial={{ width: 0 }}
              animate={{ width: `${String((answered / quiz.questionCount) * 100)}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
        </div>
      </div>

      <div className={styles.questionContainer}>
        <AnimatePresence mode="wait" custom={direction}>
          {question ? (
            <motion.fieldset
              key={question.id}
              className={styles.question}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <motion.legend variants={itemVariants} className={styles.questionPrompt}>
                {question.prompt}
              </motion.legend>
              <div className={styles.options}>
                {question.options.map((option, optionIndex) => {
                  const checked = (answers[question.id] ?? []).includes(optionIndex);
                  return (
                    <motion.label
                      variants={itemVariants}
                      key={option}
                      className={cn(
                        styles.optionCard,
                        checked && styles.optionCardSelected,
                      )}
                      whileHover={{ scale: 1.015, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="checkbox"
                        className={styles.srOnly}
                        checked={checked}
                        onChange={() => {
                          setAnswers((prev) => ({
                            ...prev,
                            [question.id]: toggle(prev[question.id] ?? [], optionIndex),
                          }));
                        }}
                      />
                      <motion.div
                        className={cn(styles.optionBox, checked && styles.optionBoxOn)}
                        animate={{
                          scale: checked ? [1, 1.2, 1] : 1,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {checked ? <AnimatedCheck /> : null}
                      </motion.div>
                      <span className={styles.optionText}>{option}</span>
                    </motion.label>
                  );
                })}
              </div>
            </motion.fieldset>
          ) : null}
        </AnimatePresence>
      </div>

      <div className={styles.runnerFoot}>
        <Button
          variant="outline"
          disabled={currentIndex === 0 || isSubmitting}
          onClick={() => {
            paginate(-1);
          }}
          style={{ padding: '0.75rem 1.5rem', borderRadius: '99px' }}
        >
          <ChevronLeft size={16} style={{ marginRight: '0.5rem' }} /> Previous
        </Button>

        {currentIndex < quiz.questionCount - 1 ? (
          <Button
            variant="default"
            onClick={() => {
              paginate(1);
            }}
            style={{ padding: '0.75rem 1.5rem', borderRadius: '99px' }}
          >
            Next <ChevronRight size={16} style={{ marginLeft: '0.5rem' }} />
          </Button>
        ) : (
          <Button
            variant="accent"
            disabled={!allAnswered || isSubmitting}
            isLoading={isSubmitting}
            onClick={() => {
              onSubmit(answers);
            }}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '99px',
            }}
          >
            Submit Quiz <Check size={18} style={{ marginLeft: '0.5rem' }} />
          </Button>
        )}
      </div>
    </div>
  );
};

export interface QuizContentProps {
  readonly quiz: Quiz;
  readonly result: QuizResult | null;
  readonly userAnswers?: Record<string, string[]> | null | undefined;
  readonly canAttempt?: boolean | undefined;
  readonly isQuizUpdated?: boolean | undefined;
  readonly attempt: number;
  readonly isSubmitting: boolean;
  readonly certificateReady: boolean;
  readonly isPostSubmission?: boolean | undefined;
  readonly onSubmit: (answers: QuizAnswers) => void;
  readonly onRetake: () => void;
}

export const QuizContent = ({
  quiz,
  result,
  userAnswers,
  canAttempt = true,
  isQuizUpdated = false,
  attempt,
  isSubmitting,
  certificateReady,
  isPostSubmission = false,
  onSubmit,
  onRetake,
}: QuizContentProps): ReactElement =>
  result !== null ? (
    <QuizResultView
      result={result}
      quiz={quiz}
      userAnswers={userAnswers ?? null}
      canAttempt={canAttempt}
      isQuizUpdated={isQuizUpdated}
      certificateReady={certificateReady}
      isPostSubmission={isPostSubmission}
      onRetake={onRetake}
    />
  ) : (
    <QuizForm key={attempt} quiz={quiz} isSubmitting={isSubmitting} onSubmit={onSubmit} />
  );
