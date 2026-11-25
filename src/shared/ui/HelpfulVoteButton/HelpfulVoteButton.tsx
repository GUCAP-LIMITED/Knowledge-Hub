import type { ReactElement } from 'react';
import { ThumbsUp } from 'lucide-react';
import { cn } from '@shared/utils';
import { Spinner } from '../Spinner/Spinner';
import styles from './HelpfulVoteButton.module.css';

export interface HelpfulVoteButtonProps {
  readonly isHelpful: boolean;
  readonly helpfulCount: number;
  readonly isPending: boolean;
  readonly onVote: () => void;
  readonly prompt?: string;
  readonly className?: string;
}

export const HelpfulVoteButton = ({
  isHelpful,
  helpfulCount,
  isPending,
  onVote,
  prompt = 'Did you find this helpful?',
  className,
}: HelpfulVoteButtonProps): ReactElement => (
  <div className={cn(styles.container, className)}>
    {prompt.length > 0 ? <span className={styles.title}>{prompt}</span> : null}
    <button
      type="button"
      className={cn(styles.button, isHelpful && styles.active)}
      onClick={onVote}
      disabled={isPending}
      aria-pressed={isHelpful}
      aria-label={isHelpful ? 'Remove helpful vote' : 'Mark as helpful'}
    >
      {isPending ? (
        <Spinner size="sm" />
      ) : (
        <ThumbsUp
          size={14}
          aria-hidden="true"
          fill={isHelpful ? 'currentColor' : 'none'}
        />
      )}
      <span>{isHelpful ? 'You found this helpful' : 'Yes, this was helpful'}</span>
      {helpfulCount > 0 ? (
        <span className={styles.countBadge}>{helpfulCount}</span>
      ) : null}
    </button>
  </div>
);
