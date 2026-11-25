/* eslint-disable max-lines-per-function, complexity */
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Award, RotateCcw, XCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button, Celebration, Alert } from '@shared/ui';
import { cn } from '@shared/utils';
import { motion } from 'motion/react';
import type { Quiz, QuizResult } from '../domain';
import { QuizAnswersSlider } from './QuizAnswersSlider';
import styles from './QuizSection.module.css';

export interface QuizResultViewProps {
  readonly result: QuizResult;
  readonly quiz?: Quiz | undefined;
  readonly userAnswers?: Record<string, string[]> | null | undefined;
  readonly canAttempt?: boolean | undefined;
  readonly isQuizUpdated?: boolean | undefined;
  readonly certificateReady?: boolean | undefined;
  readonly isPostSubmission?: boolean | undefined;
  readonly onRetake: () => void;
}

import { BestScoreCard } from './BestScoreCard';

const PassActions = ({
  certificateReady,
  canAttempt,
  isQuizUpdated,
  onRetake,
}: {
  readonly certificateReady?: boolean | undefined;
  readonly canAttempt?: boolean | undefined;
  readonly isQuizUpdated?: boolean | undefined;
  readonly onRetake?: (() => void) | undefined;
}): ReactElement => (
  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
    {certificateReady ? (
      <Button asChild size="lg">
        <Link to="/certificates">
          <Award aria-hidden /> View certificate
        </Link>
      </Button>
    ) : null}
    {canAttempt && onRetake ? (
      <Button variant={isQuizUpdated ? 'default' : 'outline'} onClick={onRetake}>
        <RotateCcw size={16} style={{ marginRight: '0.25rem' }} />{' '}
        {isQuizUpdated ? 'Take Updated Quiz' : 'Retake quiz'}
      </Button>
    ) : null}
  </div>
);

export const QuizResultView = ({
  result,
  quiz,
  userAnswers,
  canAttempt = true,
  isQuizUpdated = false,
  certificateReady = false,
  isPostSubmission = false,
  onRetake,
}: QuizResultViewProps): ReactElement => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
      width: '100%',
      maxWidth: 720,
      margin: '0 auto',
    }}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(styles.result, result.passed ? styles.resultPass : styles.resultFail)}
    >
      <Celebration show={result.passed} />

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
        className={styles.resultIcon}
      >
        {result.passed ? (
          <Award size={48} aria-hidden />
        ) : (
          <XCircle size={48} aria-hidden />
        )}
      </motion.div>

      <div>
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={styles.resultTitle}
        >
          {result.passed ? 'You passed!' : 'Not quite yet'}
        </motion.h3>
        <p className={styles.resultSubtitle}>
          {isPostSubmission
            ? result.passed
              ? 'Great job on completing this quiz attempt.'
              : 'Review your submitted answers below to strengthen your understanding.'
            : result.passed
              ? 'You have cleared this quiz.'
              : 'You have not reached the passing score yet.'}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className={styles.resultScoreContainer}
      >
        {/* Main Focus Gauge: Shows this attempt right after submission, or best score in general */}
        <div className={styles.scoreGaugeWrapper}>
          <div className={styles.resultScoreCircle}>
            <svg viewBox="0 0 36 36" className={styles.circularChart}>
              <path
                className={styles.circleBg}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <motion.path
                className={cn(
                  styles.circle,
                  result.passed ? styles.circlePass : styles.circleFail,
                )}
                strokeDasharray={`${String(result.scorePct)}, 100`}
                initial={{ strokeDasharray: '0, 100' }}
                animate={{ strokeDasharray: `${String(result.scorePct)}, 100` }}
                transition={{ delay: 0.6, duration: 1.5, ease: 'easeOut' }}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className={styles.percentage}>
                {result.scorePct}%
              </text>
            </svg>
          </div>
          <span className={styles.gaugeBadge}>
            {isPostSubmission ? 'This Attempt Score' : 'Best Score'}
          </span>
        </div>

        {/* 3 Metric Cards: Correctness, Passing Score, Attempt Info */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Correct Answers</span>
            <strong className={styles.metricValue}>
              {result.correct} / {result.total}
            </strong>
            <span className={styles.metricSubtext}>
              {Math.round((result.correct / Math.max(1, result.total)) * 100)}% accuracy
            </span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Passing Score</span>
            <strong className={styles.metricValue}>{result.passingPercentage}%</strong>
            <span className={styles.metricSubtext}>Required to pass</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>
              {isPostSubmission ? 'Attempt' : 'Attempts'}
            </span>
            <strong className={styles.metricValue}>
              {isPostSubmission
                ? `Attempt #${String(result.attemptNumber)}`
                : `${String(result.attemptCount)} total`}
            </strong>
            <span className={styles.metricSubtext}>
              {isPostSubmission
                ? `${String(result.attemptCount)} total ${result.attemptCount === 1 ? 'attempt' : 'attempts'}`
                : result.attemptCount > 1
                  ? `Best: Attempt #${String(result.attemptNumber)}`
                  : '1st try'}
            </span>
          </div>
        </div>

        {/* Post-submission: Rich Best Score & Attempt Showcase Card */}
        {isPostSubmission ? (
          <BestScoreCard result={result} />
        ) : result.recentAttemptScore !== null &&
          result.recentAttemptScore !== result.scorePct ? (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              fontSize: '0.8125rem',
              color: 'var(--color-text-subtle)',
              textAlign: 'center',
              width: '100%',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            Latest retake (Attempt #{String(result.attemptCount)}) score:{' '}
            <strong style={{ color: 'var(--color-text)' }}>
              {result.recentAttemptScore}%
            </strong>
            . Your official course grade retains your highest score of{' '}
            <strong style={{ color: 'var(--color-text)' }}>{result.scorePct}%</strong>.
          </div>
        ) : null}

        {isQuizUpdated ? (
          <Alert tone="warning" title="Quiz Updated by Instructor">
            {result.passed
              ? 'You previously passed this quiz. The instructor has since updated it with new content. Your passing credit is preserved, but you may retake it to review the updates.'
              : 'The instructor updated this quiz with new content. You have been granted a fresh attempt!'}
          </Alert>
        ) : null}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className={styles.resultActions}
      >
        {result.passed ? (
          <PassActions
            certificateReady={certificateReady}
            canAttempt={canAttempt}
            isQuizUpdated={isQuizUpdated}
            onRetake={onRetake}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {canAttempt ? (
                <Button variant="accent" onClick={onRetake}>
                  <RotateCcw size={16} style={{ marginRight: '0.25rem' }} />{' '}
                  {isQuizUpdated ? 'Take Updated Quiz' : 'Retake quiz'}
                </Button>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--color-text-subtle)',
                    fontSize: '0.875rem',
                  }}
                >
                  <AlertCircle size={16} /> Multiple attempts are not allowed for this
                  quiz version.
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>

    {/* Read-Only Answer Review Slider */}
    {quiz && userAnswers ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className={styles.reviewSectionHeader}>
          <h4 className={styles.reviewSectionTitle}>
            <CheckCircle2 size={18} style={{ color: 'var(--color-primary)' }} />{' '}
            {isPostSubmission
              ? 'Review Submitted Answers'
              : 'Review Best Attempt Answers'}
          </h4>
          <span className={styles.gaugeBadge}>
            Attempt #{String(result.attemptNumber)}
          </span>
        </div>
        <QuizAnswersSlider
          quiz={quiz}
          userAnswers={userAnswers}
          isPreviousAttempt={isQuizUpdated && result.quizVersion < quiz.version}
        />
      </div>
    ) : null}
  </div>
);
