import { useMemo, useState, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, MoreHorizontal, Trash2 } from 'lucide-react';
import {
  Avatar,
  DropdownMenu,
  EmptyState,
  FilterBar,
  IconButton,
  Select,
  TextField,
} from '@shared/ui';
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
  onViewCourse,
}: {
  readonly review: Review;
  readonly deleting: boolean;
  readonly onDelete: (id: string) => void;
  readonly onViewCourse: (courseId: string) => void;
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
      <div className={styles.reviewRight}>
        <StarRating value={review.rating} size="sm" />
        <DropdownMenu
          align="end"
          trigger={
            <IconButton label="Review actions">
              <MoreHorizontal size={16} />
            </IconButton>
          }
          items={[
            {
              label: 'View course',
              icon: <ExternalLink size={15} />,
              onSelect: () => {
                onViewCourse(review.courseId);
              },
            },
            {
              label: 'Delete review',
              danger: true,
              disabled: deleting,
              icon: <Trash2 size={15} />,
              onSelect: () => {
                onDelete(review.id);
              },
            },
          ]}
        />
      </div>
    </div>
    <p className={styles.reviewText}>{review.feedback}</p>
  </div>
);

export interface RecentReviewsCardProps {
  readonly reviews: readonly Review[];
  readonly deleting: boolean;
  readonly onDelete: (id: string) => void;
}

/** Filterable, scrollable list of reviews with per-item moderation actions. */
export const RecentReviewsCard = ({
  reviews,
  deleting,
  onDelete,
}: RecentReviewsCardProps): ReactElement => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [rating, setRating] = useState('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reviews.filter(
      (r) =>
        (rating === 'all' || r.rating === Number(rating)) &&
        (q === '' ||
          r.userName.toLowerCase().includes(q) ||
          r.courseName.toLowerCase().includes(q) ||
          r.feedback.toLowerCase().includes(q)),
    );
  }, [reviews, query, rating]);

  return (
    <div className={styles.card}>
      <div className={styles.recentHead}>
        <h2 className={styles.cardHeading}>Recent Reviews</h2>
        <span className={styles.recentCount}>{filtered.length}</span>
      </div>
      <FilterBar
        search={
          <TextField
            label="Search"
            placeholder="Search reviewer, course, feedback…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
          />
        }
        controls={
          <Select
            label="Rating"
            value={rating}
            onChange={(event) => {
              setRating(event.target.value);
            }}
          >
            <option value="all">All ratings</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} star{n === 1 ? '' : 's'}
              </option>
            ))}
          </Select>
        }
      />
      {filtered.length === 0 ? (
        <EmptyState
          title="No reviews match"
          description="Try another search or rating."
        />
      ) : (
        <div className={styles.reviewScroll}>
          <div className={styles.reviewList}>
            {filtered.map((review) => (
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
