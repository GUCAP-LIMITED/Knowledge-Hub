import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RecentReview, TopRatedCourse } from '../domain';
import { RecentReviewsCard, TopRatedCard } from './CourseReviewsParts';

vi.mock('@features/users', () => ({
  useMyCapabilities: () => ({
    can: () => true,
  }),
}));

const mockCourses: TopRatedCourse[] = [
  new TopRatedCourse({
    courseId: 'course-101',
    title: 'Automated Course 10',
    slug: 'automated-course-10',
    averageRating: 5.0,
    totalReviews: 1,
    totalHelpfulVotes: 0,
    thumbnailUrl: null,
  }),
  new TopRatedCourse({
    courseId: 'course-102',
    title: 'Mastering Testing',
    slug: 'mastering-testing',
    averageRating: 4.9,
    totalReviews: 8,
    totalHelpfulVotes: 12,
    thumbnailUrl: null,
  }),
];

const mockRecentReview = new RecentReview({
  id: 'review-1',
  contentItemId: 'course-101',
  courseTitle: 'Automated Course 10',
  courseSlug: 'automated-course-10',
  courseThumbnailUrl: null,
  userId: 'user-1',
  reviewerName: 'System Admin',
  reviewerEmail: 'admin@example.com',
  rating: 5,
  feedback: 'Great course!',
  helpfulCount: 2,
  creationTime: new Date('2026-03-01T10:00:00Z'),
  isHelpful: false,
});

describe('CourseReviewsParts navigation', () => {
  describe('<TopRatedCard />', () => {
    it('renders top rated courses as links to their course details pages', () => {
      render(
        <MemoryRouter>
          <TopRatedCard courses={mockCourses} />
        </MemoryRouter>,
      );

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);

      expect(links[0]).toHaveAttribute('href', '/courses/automated-course-10');
      expect(links[0]).toHaveTextContent('Automated Course 10');

      expect(links[1]).toHaveAttribute('href', '/courses/mastering-testing');
      expect(links[1]).toHaveTextContent('Mastering Testing');
    });

    it('renders empty state when there are no courses', () => {
      render(
        <MemoryRouter>
          <TopRatedCard courses={[]} />
        </MemoryRouter>,
      );

      expect(screen.getByText('No rated courses')).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('<RecentReviewsCard />', () => {
    it('renders the course title as a link navigating to the course details page', () => {
      render(
        <MemoryRouter>
          <RecentReviewsCard
            reviews={[mockRecentReview]}
            totalCount={1}
            query=""
            rating="all"
            onQueryChange={vi.fn()}
            onRatingChange={vi.fn()}
            deleting={false}
            onDelete={vi.fn()}
          />
        </MemoryRouter>,
      );

      const courseLink = screen.getByRole('link', { name: 'Automated Course 10' });
      expect(courseLink).toBeInTheDocument();
      expect(courseLink).toHaveAttribute('href', '/courses/automated-course-10');
    });
  });
});
