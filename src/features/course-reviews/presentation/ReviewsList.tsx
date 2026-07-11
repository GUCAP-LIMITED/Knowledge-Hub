import type { ReactElement, ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import { Alert, EmptyState, Spinner } from '@shared/ui';
import type { Review } from '../domain';
import { ReviewCard } from './ReviewCard';
import styles from './ReviewsList.module.css';

export interface ReviewsListProps {
  readonly query: UseQueryResult<readonly Review[]>;
  readonly onHelpful?: (id: string) => void;
  readonly helpfulBusy?: boolean;
  readonly renderActions?: (review: Review) => ReactNode;
}

/** Renders a reviews query's loading / error / empty / list states. */
export const ReviewsList = ({
  query,
  onHelpful,
  helpfulBusy,
  renderActions,
}: ReviewsListProps): ReactElement => {
  if (query.isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" label="Loading reviews" />
      </div>
    );
  }
  if (query.isError) {
    return (
      <Alert tone="error" title="Could not load reviews">
        {query.error.message}
      </Alert>
    );
  }
  const reviews = query.data ?? [];
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
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
        >
          {renderActions?.(review)}
        </ReviewCard>
      ))}
    </div>
  );
};
