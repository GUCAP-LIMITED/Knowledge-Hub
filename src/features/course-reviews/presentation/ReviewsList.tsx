import type { ReactElement, ReactNode } from 'react';
import { Alert, EmptyState, Skeleton } from '@shared/ui';
import type { Review, PagedResult } from '../domain';
import { ReviewCard } from './ReviewCard';
import styles from './ReviewsList.module.css';
import cardStyles from './ReviewCard.module.css';

const ReviewCardSkeleton = (): ReactElement => (
  <div className={cardStyles.card} aria-hidden="true">
    <div className={cardStyles.head}>
      <div className={cardStyles.who}>
        <Skeleton width="45%" height={14} />
        <Skeleton width="30%" height={12} />
      </div>
      <Skeleton width={90} height={14} />
    </div>
    <Skeleton width="90%" height={12} />
    <Skeleton width="70%" height={12} />
    <div className={cardStyles.foot}>
      <Skeleton width="20%" height={12} />
    </div>
  </div>
);

export interface ReviewsListQueryState {
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly error: { message: string } | null;
  readonly data?: readonly Review[] | PagedResult<Review> | undefined;
}

export interface ReviewsListProps {
  readonly query: ReviewsListQueryState;
  readonly onHelpful?: ((id: string, isHelpful?: boolean) => void) | undefined;
  readonly helpfulBusy?: boolean | undefined;
  readonly currentUserId?: string | undefined;
  readonly canVoteHelpful?: boolean | undefined;
  readonly onDelete?: ((id: string) => void) | undefined;
  readonly deleteBusy?: boolean | undefined;
  readonly canDelete?: boolean | undefined;
  readonly renderActions?: ((review: Review) => ReactNode) | undefined;
}

const extractReviews = (
  data: readonly Review[] | PagedResult<Review> | undefined,
): readonly Review[] => {
  if (!data) {
    return [];
  }
  if ('items' in data) {
    return data.items;
  }
  return data;
};

/** Renders a reviews query's loading / error / empty / list states. */
export const ReviewsList = ({
  query,
  onHelpful,
  helpfulBusy,
  currentUserId,
  canVoteHelpful,
  onDelete,
  deleteBusy,
  canDelete,
  renderActions,
}: ReviewsListProps): ReactElement => {
  if (query.isLoading) {
    return (
      <div className={styles.list}>
        {Array.from({ length: 4 }, (_unused, index) => (
          <ReviewCardSkeleton key={`skeleton-review-${String(index)}`} />
        ))}
      </div>
    );
  }
  if (query.isError) {
    return (
      <Alert tone="error" title="Could not load reviews">
        {query.error?.message ?? 'An error occurred while loading reviews'}
      </Alert>
    );
  }
  const reviews = extractReviews(query.data);

  if (reviews.length === 0) {
    return (
      <EmptyState
        title="No reviews yet"
        description="Be the first to share your feedback."
      />
    );
  }
  return (
    <div className={styles.list}>
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          onHelpful={onHelpful}
          helpfulBusy={helpfulBusy}
          currentUserId={currentUserId}
          canVoteHelpful={canVoteHelpful}
          onDelete={onDelete}
          deleteBusy={deleteBusy}
          canDelete={canDelete}
        >
          {renderActions?.(review)}
        </ReviewCard>
      ))}
    </div>
  );
};
