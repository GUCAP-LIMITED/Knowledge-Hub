import type { ReactElement, ReactNode } from 'react';
import { ThumbsUp, Trash2 } from 'lucide-react';
import { Button, IconButton } from '@shared/ui';
import { formatUserType } from '@shared/utils';
import { useMyCapabilities } from '@features/users';
import type { Review } from '../domain';
import { StarRating } from './StarRating';
import styles from './ReviewCard.module.css';

export interface ReviewCardProps {
  readonly review: Review;
  readonly onHelpful?: ((id: string, isHelpful?: boolean) => void) | undefined;
  readonly helpfulBusy?: boolean | undefined;
  readonly currentUserId?: string | undefined;
  readonly canVoteHelpful?: boolean | undefined;
  readonly onDelete?: ((id: string) => void) | undefined;
  readonly deleteBusy?: boolean | undefined;
  /** Explicit permission override; defaults to inspecting the 'reviews.delete' capability. */
  readonly canDelete?: boolean | undefined;
  /** Optional action controls (e.g. a moderation delete button). */
  readonly children?: ReactNode;
}

interface HelpfulActionProps {
  readonly review: Review;
  readonly isOwnReview: boolean;
  readonly isLoggedIn: boolean;
  readonly onHelpful?: ((id: string, isHelpful?: boolean) => void) | undefined;
  readonly helpfulBusy?: boolean | undefined;
  readonly canVoteHelpful: boolean;
}

const getHelpfulButtonTitle = (
  canVote: boolean,
  isHelpful: boolean,
  isLoggedIn: boolean,
): string => {
  if (!isLoggedIn) {
    return 'Sign in to vote helpful';
  }
  if (!canVote) {
    return 'Only enrolled learners who completed this content can vote';
  }
  return isHelpful ? 'Remove helpful vote' : 'Mark as helpful';
};

const HelpfulAction = ({
  review,
  isOwnReview,
  isLoggedIn,
  onHelpful,
  helpfulBusy,
  canVoteHelpful,
}: HelpfulActionProps): ReactElement | null => {
  if (isOwnReview) {
    if (review.helpful > 0) {
      return <span className={styles.count}>{review.helpful} found this helpful</span>;
    }
    return null;
  }

  if (onHelpful === undefined) {
    return <span className={styles.count}>{review.helpful} found this helpful</span>;
  }

  const isButtonDisabled = (helpfulBusy ?? false) || !canVoteHelpful || !isLoggedIn;

  return (
    <Button
      size="sm"
      variant={review.isHelpful ? 'outline' : 'ghost'}
      className={review.isHelpful ? styles.helpfulActive : undefined}
      disabled={isButtonDisabled}
      aria-pressed={review.isHelpful}
      title={getHelpfulButtonTitle(canVoteHelpful, review.isHelpful, isLoggedIn)}
      onClick={() => {
        onHelpful(review.id, review.isHelpful);
      }}
    >
      <ThumbsUp
        size={14}
        className={review.isHelpful ? styles.iconActive : styles.icon}
        aria-hidden="true"
      />
      <span>Helpful ({review.helpful})</span>
    </Button>
  );
};

/** A single review: who, their rating, the comment, date and a helpful vote. */
export const ReviewCard = ({
  review,
  onHelpful,
  helpfulBusy,
  currentUserId,
  canVoteHelpful = true,
  onDelete,
  deleteBusy = false,
  canDelete,
  children,
}: ReviewCardProps): ReactElement => {
  const isOwnReview = currentUserId !== undefined && review.isBy(currentUserId);
  const isLoggedIn = currentUserId !== undefined;
  const { can } = useMyCapabilities();
  const effectiveCanDelete = canDelete ?? can('reviews', 'delete');

  return (
    <article className={styles.card}>
      <div className={styles.head}>
        <div className={styles.who}>
          <span className={styles.course}>{review.contentName}</span>
          <span className={styles.author}>
            {review.userName} · {formatUserType(review.userRole)}
          </span>
        </div>
        <StarRating value={review.rating} size="sm" />
      </div>
      <p className={styles.feedback}>{review.feedback}</p>
      <div className={styles.foot}>
        <span className={styles.date}>{review.createdAt.toLocaleDateString()}</span>
        <div className={styles.actions}>
          <HelpfulAction
            review={review}
            isOwnReview={isOwnReview}
            isLoggedIn={isLoggedIn}
            onHelpful={onHelpful}
            helpfulBusy={helpfulBusy}
            canVoteHelpful={canVoteHelpful}
          />
          {effectiveCanDelete && onDelete !== undefined ? (
            <IconButton
              label="Delete review"
              variant="danger"
              disabled={deleteBusy}
              onClick={() => {
                onDelete(review.id);
              }}
            >
              <Trash2 size={14} aria-hidden="true" />
            </IconButton>
          ) : null}
          {children}
        </div>
      </div>
    </article>
  );
};
