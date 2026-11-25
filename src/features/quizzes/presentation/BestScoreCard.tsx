/* eslint-disable max-lines-per-function, complexity */
import type { ReactElement } from 'react';
import { Trophy, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@shared/utils';
import type { QuizResult } from '../domain';
import styles from './QuizSection.module.css';

export interface BestScoreCardProps {
  readonly result: QuizResult;
}

export const BestScoreCard = ({ result }: BestScoreCardProps): ReactElement | null => {
  // Scenario 1: First attempt ever
  if (result.attemptCount <= 1) {
    return (
      <div className={styles.bestCard}>
        <div className={styles.bestCardHeader}>
          <span className={styles.bestBadgePill}>
            <Sparkles size={15} aria-hidden /> First Attempt Recorded
          </span>
          <span className={styles.bestAttemptChip}>Attempt #1</span>
        </div>
        <p className={styles.bestCardFooter}>
          {result.passed
            ? 'Awesome start! You cleared the passing score on your very first try. You can retake anytime if you want to aim for 100%.'
            : 'Your initial attempt is recorded. Review your submitted answers below and feel free to retake when you are ready!'}
        </p>
      </div>
    );
  }

  // Scenario 2: New Best Score achieved on this attempt!
  if (result.isNewBest) {
    return (
      <div className={cn(styles.bestCard, styles.bestCardNewBest)}>
        <div className={styles.bestCardHeader}>
          <span className={styles.bestBadgePill}>
            <Sparkles size={15} aria-hidden /> New Personal Best!
          </span>
          <span className={styles.bestAttemptChip}>Attempt #{result.attemptNumber}</span>
        </div>
        <div className={styles.bestCardBody}>
          <div className={styles.bestScoreGroup}>
            <span className={styles.bestScoreNumber}>{result.scorePct}%</span>
            <span className={styles.bestScoreLabel}>Highest Grade</span>
          </div>
          <span
            className={cn(
              styles.bestStatusPill,
              result.passed ? styles.bestStatusPass : styles.bestStatusFail,
            )}
          >
            {result.passed ? 'Passed' : 'In Progress'}
          </span>
        </div>
        <p className={styles.bestCardFooter}>
          Outstanding improvement! You set a new high score for this quiz version, which
          has been recorded for your course progress.
        </p>
      </div>
    );
  }

  // Scenario 3: Higher Best Score previously achieved
  if (result.bestScore !== null && result.bestScore > result.scorePct) {
    return (
      <div className={styles.bestCard}>
        <div className={styles.bestCardHeader}>
          <span className={styles.bestBadgePill}>
            <Trophy size={15} aria-hidden /> Highest Score Preserved
          </span>
          <span className={styles.bestAttemptChip}>
            Achieved in Attempt #{result.bestAttemptNumber ?? 1}
          </span>
        </div>
        <div className={styles.bestCardBody}>
          <div className={styles.bestScoreGroup}>
            <span className={styles.bestScoreNumber}>{result.bestScore}%</span>
            <span className={styles.bestScoreLabel}>Your Best Score</span>
          </div>
          <span
            className={cn(
              styles.bestStatusPill,
              result.bestPassed ? styles.bestStatusPass : styles.bestStatusFail,
            )}
          >
            {result.bestPassed ? 'Passed' : 'Highest Attempt'}
          </span>
        </div>
        <p className={styles.bestCardFooter}>
          Your course progress retains your highest score of{' '}
          <strong style={{ color: 'var(--color-text)' }}>{result.bestScore}%</strong>.
          Retaking for practice never lowers your standing or credits!
        </p>
      </div>
    );
  }

  // Scenario 4: Matched previous best score
  if (result.bestScore !== null && result.bestScore === result.scorePct) {
    return (
      <div className={cn(styles.bestCard, styles.bestCardMatched)}>
        <div className={styles.bestCardHeader}>
          <span className={styles.bestBadgePill}>
            <CheckCircle2 size={15} aria-hidden /> Matched Highest Score
          </span>
          <span className={styles.bestAttemptChip}>Attempt #{result.attemptNumber}</span>
        </div>
        <div className={styles.bestCardBody}>
          <div className={styles.bestScoreGroup}>
            <span className={styles.bestScoreNumber}>{result.scorePct}%</span>
            <span className={styles.bestScoreLabel}>
              Matched Attempt #{result.bestAttemptNumber}
            </span>
          </div>
          <span
            className={cn(
              styles.bestStatusPill,
              result.passed ? styles.bestStatusPass : styles.bestStatusFail,
            )}
          >
            {result.passed ? 'Passed' : 'Highest Attempt'}
          </span>
        </div>
        <p className={styles.bestCardFooter}>
          Consistent knowledge retention! Your best score remains securely at{' '}
          <strong style={{ color: 'var(--color-text)' }}>{result.scorePct}%</strong>.
        </p>
      </div>
    );
  }

  return null;
};
