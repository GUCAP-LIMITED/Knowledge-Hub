import type { ReactElement } from 'react';
import { Play, X } from 'lucide-react';
import styles from './TutorialPlaylist.module.css';

export interface AutoplayTransitionCardProps {
  readonly countdown: number;
  readonly totalDelay?: number;
  readonly nextVideoTitle: string;
  readonly onPlayNow?: (() => void) | undefined;
  readonly onCancel?: (() => void) | undefined;
}

export const AutoplayTransitionCard = ({
  countdown,
  totalDelay = 3,
  nextVideoTitle,
  onPlayNow,
  onCancel,
}: AutoplayTransitionCardProps): ReactElement => {
  const percent = Math.min(
    100,
    Math.max(0, ((totalDelay - countdown + 1) / totalDelay) * 100),
  );

  return (
    <div
      className={styles.transitionCard}
      role="status"
      aria-live="polite"
      aria-label={`Autoplay next video in ${String(countdown)} seconds`}
    >
      <div className={styles.transitionHeader}>
        <div className={styles.countdownBadge} aria-hidden="true">
          <span className={styles.countdownNumber}>{String(countdown)}s</span>
        </div>
        <div className={styles.transitionMeta}>
          <div className={styles.transitionLabel}>Up Next in {String(countdown)}s</div>
          <div className={styles.transitionTitle} title={nextVideoTitle}>
            {nextVideoTitle}
          </div>
        </div>
        <div className={styles.transitionButtons}>
          {onPlayNow ? (
            <button
              type="button"
              className={styles.playNowButton}
              onClick={onPlayNow}
              title="Play next video immediately"
              aria-label="Play next video now"
            >
              <Play size={11} aria-hidden="true" style={{ fill: 'currentColor' }} />
              <span>Play</span>
            </button>
          ) : null}
          {onCancel ? (
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
              title="Cancel autoplay"
              aria-label="Cancel autoplay"
            >
              <X size={12} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
      <div className={styles.countdownTrack}>
        <div className={styles.countdownFill} style={{ width: `${String(percent)}%` }} />
      </div>
    </div>
  );
};
