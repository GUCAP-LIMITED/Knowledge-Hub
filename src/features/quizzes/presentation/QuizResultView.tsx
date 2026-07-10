import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Award, RotateCcw, XCircle } from 'lucide-react';
import { Button } from '@shared/ui';
import { cn } from '@shared/utils';
import type { QuizResult } from '../domain';
import styles from './QuizSection.module.css';

export interface QuizResultViewProps {
  readonly result: QuizResult;
  /** Retake the quiz from scratch. */
  readonly onRetake: () => void;
  /** Re-watch / revisit the underlying content. */
  readonly onRewatch: () => void;
  readonly rewatchLabel: string;
}

/** Pass/fail outcome screen with the follow-up actions each path unlocks. */
export const QuizResultView = ({
  result,
  onRetake,
  onRewatch,
  rewatchLabel,
}: QuizResultViewProps): ReactElement => (
  <div
    className={cn(styles.result, result.passed ? styles.resultPass : styles.resultFail)}
  >
    <div className={styles.resultIcon}>
      {result.passed ? (
        <Award size={28} aria-hidden />
      ) : (
        <XCircle size={28} aria-hidden />
      )}
    </div>
    <h3 className={styles.resultTitle}>
      {result.passed ? 'You passed!' : 'Not quite yet'}
    </h3>
    <p className={styles.resultScore}>
      You scored {result.scorePct}% ({result.correct}/{result.total}) · {result.passMark}%
      needed
    </p>
    <div className={styles.resultActions}>
      {result.passed ? (
        <Link to="/certificates" className={styles.certLink}>
          <Award size={16} aria-hidden /> View certificate
        </Link>
      ) : (
        <>
          <Button variant="accent" onClick={onRetake}>
            <RotateCcw size={16} aria-hidden /> Retake quiz
          </Button>
          <Button variant="secondary" onClick={onRewatch}>
            {rewatchLabel}
          </Button>
        </>
      )}
    </div>
  </div>
);
