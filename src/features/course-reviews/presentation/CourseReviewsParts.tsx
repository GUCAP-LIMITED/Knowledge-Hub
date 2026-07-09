import type { ReactElement } from 'react';
import { Avatar, Button } from '@shared/ui';
import { cn } from '@shared/utils';
import type { Review } from '../domain';
import { StarRating } from './StarRating';
import { type CourseRating, ratingBand } from './course-reviews-analytics';
import styles from './CourseReviewsPage.module.css';

export interface TopRatedCardProps {
  readonly courses: readonly CourseRating[];
}

/** Ranked list of courses by average rating. */
export const TopRatedCard = ({ courses }: TopRatedCardProps): ReactElement => (
  <div className={styles.card}>
    <h2 className={styles.cardHeading}>Top Rated Courses</h2>
    {courses.map((course, index) => (
      <div key={course.courseId} className={styles.rankRow}>
        <span className={cn(styles.rank, index === 0 && styles.rankTop)}>
          {index + 1}
        </span>
        <div className={styles.rankBody}>
          <span className={styles.rankTitle}>{course.courseName}</span>
          <div className={styles.rankMeta}>
            <StarRating value={Math.round(course.avg)} size="sm" />
            <span className={styles.rankStat}>
              {course.avg.toFixed(1)} • {course.count} review
              {course.count === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const RecentReviewItem = ({
  review,
  deleting,
  onDelete,
}: {
  readonly review: Review;
  readonly deleting: boolean;
  readonly onDelete: (id: string) => void;
}): ReactElement => (
  <div className={cn(styles.reviewItem, styles[ratingBand(review.rating)])}>
    <div className={styles.reviewTop}>
      <div className={styles.reviewer}>
        <Avatar name={review.userName} size={28} />
        <div>
          <div className={styles.reviewerName}>{review.userName}</div>
          <div className={styles.reviewerCourse}>{review.courseName}</div>
        </div>
      </div>
      <StarRating value={review.rating} size="sm" />
    </div>
    <p className={styles.reviewText}>{review.feedback}</p>
    <div className={styles.reviewFoot}>
      <Button
        size="sm"
        variant="ghost"
        disabled={deleting}
        onClick={() => {
          onDelete(review.id);
        }}
      >
        Delete
      </Button>
    </div>
  </div>
);

export interface RecentReviewsCardProps {
  readonly reviews: readonly Review[];
  readonly deleting: boolean;
  readonly onDelete: (id: string) => void;
}

/** The five most recent reviews, with a moderation delete on each. */
export const RecentReviewsCard = ({
  reviews,
  deleting,
  onDelete,
}: RecentReviewsCardProps): ReactElement => (
  <div className={styles.card}>
    <h2 className={styles.cardHeading}>Recent Reviews</h2>
    <div className={styles.reviewList}>
      {reviews.slice(0, 5).map((review) => (
        <RecentReviewItem
          key={review.id}
          review={review}
          deleting={deleting}
          onDelete={onDelete}
        />
      ))}
    </div>
  </div>
);
