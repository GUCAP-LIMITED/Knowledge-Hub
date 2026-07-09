import type { Review } from '../domain';

export interface ReviewStats {
  readonly total: number;
  readonly avg: string;
  readonly coursesRated: number;
  readonly helpful: number;
}

export interface CourseRating {
  readonly courseId: string;
  readonly courseName: string;
  readonly avg: number;
  readonly count: number;
}

const mean = (values: readonly number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

/** Top-line metrics across every review. */
export const computeStats = (reviews: readonly Review[]): ReviewStats => {
  const courses = new Set(reviews.map((review) => review.courseId));
  return {
    total: reviews.length,
    avg: reviews.length > 0 ? mean(reviews.map((r) => r.rating)).toFixed(1) : '—',
    coursesRated: courses.size,
    helpful: reviews.reduce((sum, review) => sum + review.helpful, 0),
  };
};

/** One rating summary per course, sorted highest-average first. */
export const topRatedCourses = (reviews: readonly Review[]): readonly CourseRating[] => {
  const byCourse = new Map<string, Review[]>();
  for (const review of reviews) {
    const bucket = byCourse.get(review.courseId) ?? [];
    bucket.push(review);
    byCourse.set(review.courseId, bucket);
  }
  return [...byCourse.entries()]
    .map(([courseId, items]) => ({
      courseId,
      courseName: items[0]?.courseName ?? 'Course',
      avg: mean(items.map((r) => r.rating)),
      count: items.length,
    }))
    .sort((a, b) => b.avg - a.avg);
};

export type RatingBand = 'high' | 'mid' | 'low';

/** Rating band used to pick a review card's left-border accent class. */
export const ratingBand = (rating: number): RatingBand => {
  if (rating >= 4) {
    return 'high';
  }
  return rating === 3 ? 'mid' : 'low';
};
