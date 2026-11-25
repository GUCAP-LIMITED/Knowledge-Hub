import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ExternalLink, MoreHorizontal, Trash2 } from 'lucide-react';
import {
  Alert,
  Avatar,
  DropdownMenu,
  type DropdownMenuItem,
  EmptyState,
  FilterBar,
  IconButton,
  RowListSkeleton,
  Select,
  TextField,
} from '@shared/ui';
import { useMyCapabilities } from '@features/users';
import { cn } from '@shared/utils';
import type { RecentReview, TopRatedCourse } from '../domain';
import { StarRating } from './StarRating';
import { ratingBand } from './course-reviews-analytics';
import styles from './CourseReviewsPage.module.css';

export interface TopRatedCardProps {
  readonly courses: readonly TopRatedCourse[];
}

/** Ranked list of courses by average rating. */
export const TopRatedCard = ({ courses }: TopRatedCardProps): ReactElement => (
  <div className={styles.card}>
    <h2 className={styles.cardHeading}>Top Rated Courses</h2>
    {courses.length === 0 ? (
      <EmptyState
        title="No rated courses"
        description="Courses with reviews will appear here."
      />
    ) : (
      <div className={styles.rankScroll}>
        {courses.map((course, index) => (
          <Link
            key={course.courseId}
            to={`/courses/${course.slug || course.courseId}`}
            className={styles.rankRow}
          >
            <span className={cn(styles.rank, index === 0 && styles.rankTop)}>
              {index + 1}
            </span>
            <div className={styles.rankBody}>
              <span className={styles.rankTitle}>{course.title}</span>
              <div className={styles.rankMeta}>
                <StarRating value={Math.round(course.averageRating)} size="sm" />
                <span className={styles.rankStat}>
                  {course.averageRating.toFixed(1)} • {course.totalReviews} review
                  {course.totalReviews === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    )}
  </div>
);

const RecentReviewItem = ({
  review,
  deleting,
  onDelete,
  onViewCourse,
}: {
  readonly review: RecentReview;
  readonly deleting: boolean;
  readonly onDelete: (id: string) => void;
  readonly onViewCourse: (courseId: string) => void;
}): ReactElement => {
  const { can } = useMyCapabilities();
  const canDelete = can('reviews', 'delete');

  const menuItems: DropdownMenuItem[] = [
    {
      label: 'View course',
      icon: <ExternalLink size={15} />,
      onSelect: () => {
        onViewCourse(review.contentItemId);
      },
    },
  ];

  if (canDelete) {
    menuItems.push({
      label: 'Delete review',
      danger: true,
      disabled: deleting,
      icon: <Trash2 size={15} />,
      onSelect: () => {
        onDelete(review.id);
      },
    });
  }

  return (
    <div className={cn(styles.reviewItem, styles[ratingBand(review.rating)])}>
      <div className={styles.reviewTop}>
        <div className={styles.reviewer}>
          <Avatar name={review.reviewerName} size={28} />
          <div>
            <div className={styles.reviewerName}>{review.reviewerName}</div>
            <Link
              to={`/courses/${review.courseSlug || review.contentItemId}`}
              className={styles.reviewerCourse}
            >
              {review.courseTitle}
            </Link>
          </div>
        </div>
        <div className={styles.reviewRight}>
          <StarRating value={review.rating} size="sm" />
          {canDelete ? (
            <IconButton
              label="Delete review"
              variant="danger"
              disabled={deleting}
              onClick={() => {
                onDelete(review.id);
              }}
            >
              <Trash2 size={15} />
            </IconButton>
          ) : null}
          <DropdownMenu
            align="end"
            trigger={
              <IconButton label="Review actions">
                <MoreHorizontal size={16} />
              </IconButton>
            }
            items={menuItems}
          />
        </div>
      </div>
      <p className={styles.reviewText}>{review.feedback}</p>
    </div>
  );
};

export interface RecentReviewsCardProps {
  readonly reviews: readonly RecentReview[];
  readonly totalCount: number;
  readonly query: string;
  readonly rating: string;
  readonly onQueryChange: (query: string) => void;
  readonly onRatingChange: (rating: string) => void;
  readonly deleting: boolean;
  readonly onDelete: (id: string) => void;
  readonly isLoading?: boolean | undefined;
  readonly isError?: boolean | undefined;
  readonly errorMessage?: string | undefined;
}

/** Filterable, scrollable list of reviews with per-item moderation actions. */
export const RecentReviewsCard = ({
  reviews,
  totalCount,
  query,
  rating,
  onQueryChange,
  onRatingChange,
  deleting,
  onDelete,
  isLoading,
  isError,
  errorMessage,
}: RecentReviewsCardProps): ReactElement => {
  const navigate = useNavigate();

  return (
    <div className={styles.card}>
      <div className={styles.recentHead}>
        <h2 className={styles.cardHeading}>Recent Reviews</h2>
        <span className={styles.recentCount}>{totalCount}</span>
      </div>
      <FilterBar
        search={
          <TextField
            label="Search"
            placeholder="Search reviewer, course, feedback…"
            value={query}
            onChange={(event) => {
              onQueryChange(event.target.value);
            }}
          />
        }
        controls={
          <Select
            label="Rating"
            value={rating}
            onChange={onRatingChange}
            options={[
              { value: 'all', label: 'All ratings' },
              ...[5, 4, 3, 2, 1].map((n) => ({
                value: String(n),
                label: `${String(n)} star${n === 1 ? '' : 's'}`,
              })),
            ]}
          />
        }
      />
      {isError ? (
        <Alert tone="error" title="Could not load reviews">
          {errorMessage ?? 'Review data is currently unavailable.'}
        </Alert>
      ) : isLoading && reviews.length === 0 ? (
        <div className={styles.reviewScroll}>
          <RowListSkeleton count={4} />
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          title="No reviews match"
          description="Try another search or rating."
        />
      ) : (
        <div className={styles.reviewScroll}>
          <div className={styles.reviewList}>
            {reviews.map((review) => (
              <RecentReviewItem
                key={review.id}
                review={review}
                deleting={deleting}
                onDelete={onDelete}
                onViewCourse={(courseId) => {
                  navigate(`/courses/${courseId}`);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
