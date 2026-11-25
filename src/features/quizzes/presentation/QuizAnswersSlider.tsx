/* eslint-disable max-lines-per-function */
import { useState, type ReactElement } from 'react';
import { ChevronLeft, ChevronRight, Check, CheckSquare } from 'lucide-react';
import { Button } from '@shared/ui';
import { cn } from '@shared/utils';
import { motion, AnimatePresence } from 'motion/react';
import type { Quiz } from '../domain';
import styles from './QuizAnswersSlider.module.css';

export interface QuizAnswersSliderProps {
  readonly quiz: Quiz;
  readonly userAnswers: Record<string, string[]>;
  readonly isPreviousAttempt?: boolean | undefined;
}

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 26,
    },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  }),
};

export const QuizAnswersSlider = ({
  quiz,
  userAnswers,
  isPreviousAttempt = false,
}: QuizAnswersSliderProps): ReactElement | null => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const totalQuestions = quiz.questions.length;
  if (totalQuestions === 0) {
    return null;
  }

  const paginate = (newDirection: number): void => {
    const nextIndex = currentIndex + newDirection;
    if (nextIndex >= 0 && nextIndex < totalQuestions) {
      setDirection(newDirection);
      setCurrentIndex(nextIndex);
    }
  };

  const jumpTo = (targetIndex: number): void => {
    if (
      targetIndex >= 0 &&
      targetIndex < totalQuestions &&
      targetIndex !== currentIndex
    ) {
      setDirection(targetIndex > currentIndex ? 1 : -1);
      setCurrentIndex(targetIndex);
    }
  };

  const question = quiz.questions[currentIndex];
  if (!question) {
    return null;
  }
  const selectedIds = userAnswers[question.id] ?? [];

  return (
    <div
      className={styles.sliderCard}
      role="region"
      aria-label="Submitted Answers Review"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          paginate(-1);
        } else if (e.key === 'ArrowRight') {
          paginate(1);
        }
      }}
      tabIndex={0}
    >
      <div className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <div className={styles.headerIconBadge} aria-hidden>
            <CheckSquare size={20} />
          </div>
          <div>
            <h4 className={styles.title}>
              {isPreviousAttempt
                ? 'Submitted answers from your previous attempt'
                : 'Your Submitted Answers'}
            </h4>
            <p className={styles.subtitle}>
              {isPreviousAttempt
                ? 'Showing responses recorded prior to the latest quiz update'
                : 'Review your submitted responses question by question'}
            </p>
          </div>
        </div>

        {totalQuestions > 1 ? (
          <nav className={styles.pillNav} aria-label="Question selector">
            {quiz.questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const hasAnswers = (userAnswers[q.id]?.length ?? 0) > 0;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    jumpTo(idx);
                  }}
                  className={cn(styles.pillButton, isCurrent && styles.pillButtonActive)}
                  aria-label={`Go to Question ${String(idx + 1)}${hasAnswers ? ' (Answered)' : ''}`}
                  aria-current={isCurrent ? 'true' : undefined}
                >
                  {idx + 1}
                </button>
              );
            })}
          </nav>
        ) : null}
      </div>

      <div className={styles.slideViewport}>
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={question.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className={styles.slideContent}
          >
            <div className={styles.questionMeta}>
              <span className={styles.questionIndexTag}>
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <span className={styles.answeredTag}>
                {selectedIds.length > 0
                  ? `${String(selectedIds.length)} option${selectedIds.length > 1 ? 's' : ''} selected`
                  : isPreviousAttempt
                    ? 'Added in latest version — not in your previous attempt'
                    : 'No option selected'}
              </span>
            </div>

            <p className={styles.questionPrompt}>{question.prompt}</p>

            <div className={styles.optionsList}>
              {question.options.map((optText, optIdx) => {
                const optId = question.optionIds[optIdx] ?? `opt-${String(optIdx)}`;
                const isSelected =
                  selectedIds.includes(optId) || selectedIds.includes(String(optIdx));

                return (
                  <div
                    key={optId}
                    className={cn(
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                    )}
                  >
                    <div className={styles.optionLeft}>
                      <div
                        className={cn(
                          styles.optionCheckCircle,
                          isSelected && styles.optionCheckCircleSelected,
                        )}
                        aria-hidden
                      >
                        {isSelected ? <Check size={14} strokeWidth={3} /> : null}
                      </div>
                      <span
                        className={cn(
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                        )}
                      >
                        {optText}
                      </span>
                    </div>

                    {isSelected ? (
                      <span className={styles.yourChoiceBadge}>
                        <Check size={12} strokeWidth={3} aria-hidden /> Your Answer
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {totalQuestions > 1 ? (
        <div className={styles.footer}>
          <Button
            variant="secondary"
            disabled={currentIndex === 0}
            onClick={() => {
              paginate(-1);
            }}
            aria-label="Previous question"
          >
            <ChevronLeft size={16} style={{ marginRight: '0.25rem' }} /> Previous
          </Button>

          <span className={styles.footerCounter}>
            {currentIndex + 1} / {totalQuestions}
          </span>

          <Button
            variant="secondary"
            disabled={currentIndex === totalQuestions - 1}
            onClick={() => {
              paginate(1);
            }}
            aria-label="Next question"
          >
            Next <ChevronRight size={16} style={{ marginLeft: '0.25rem' }} />
          </Button>
        </div>
      ) : null}
    </div>
  );
};
