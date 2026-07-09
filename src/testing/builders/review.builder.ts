import { Review, type ReviewProps } from '@features/course-reviews/domain';

export type ReviewOverrides = Partial<ReviewProps>;

const DEFAULT_REVIEW: ReviewProps = {
  id: 'course-1:admin',
  courseId: 'course-1',
  courseName: 'Getting Started with UAPP Portal',
  userId: 'admin',
  userName: 'Md Shamim',
  userRole: 'Administrator',
  rating: 5,
  feedback: 'Excellent intro to the UAPP portal.',
  createdAt: new Date('2024-01-10T00:00:00.000Z'),
  helpful: 0,
};

/** Construct a valid {@link Review} for tests, overriding only what matters per case. */
export const buildReview = (overrides: ReviewOverrides = {}): Review =>
  new Review({ ...DEFAULT_REVIEW, ...overrides });
