import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Review, RecentReview } from '../domain';
import { ReviewsList } from './ReviewsList';
import { RecentReviewsCard } from './CourseReviewsParts';

let mockCanDelete = false;

vi.mock('@features/users', () => ({
  useMyCapabilities: () => ({
    can: (module: string, cap: string) =>
      module === 'reviews' && cap === 'delete' && mockCanDelete,
  }),
}));

const sampleReview = new Review({
  id: 'rev-list-1',
  contentId: 'c-1',
  contentName: 'Domain Driven Design',
  userId: 'user-1',
  userName: 'Alice',
  userRole: 'Learner',
  rating: 4,
  feedback: 'Very informative course.',
  createdAt: new Date('2026-02-01T12:00:00Z'),
  helpful: 1,
  isHelpful: false,
});

const sampleRecentReview = new RecentReview({
  id: 'recent-rev-1',
  contentItemId: 'course-123',
  courseTitle: 'Architecture Mastery',
  courseSlug: 'architecture-mastery',
  courseThumbnailUrl: null,
  userId: 'user-2',
  reviewerName: 'Bob Smith',
  reviewerEmail: 'bob@example.com',
  rating: 5,
  feedback: 'Top notch quality!',
  helpfulCount: 3,
  creationTime: new Date('2026-02-10T15:30:00Z'),
  isHelpful: false,
});

describe('Review deletion permission gating across lists', () => {
  beforeEach(() => {
    mockCanDelete = false;
  });

  describe('<ReviewsList />', () => {
    it('omits delete bin icon when user lacks reviews.delete capability', () => {
      mockCanDelete = false;

      render(
        <ReviewsList
          query={{ isLoading: false, isError: false, error: null, data: [sampleReview] }}
          onDelete={vi.fn()}
        />,
      );

      expect(
        screen.queryByRole('button', { name: /delete review/i }),
      ).not.toBeInTheDocument();
    });

    it('renders delete bin icon when user holds reviews.delete capability and onDelete is provided', () => {
      mockCanDelete = true;
      const handleDelete = vi.fn();

      render(
        <ReviewsList
          query={{ isLoading: false, isError: false, error: null, data: [sampleReview] }}
          onDelete={handleDelete}
        />,
      );

      const deleteBtn = screen.getByRole('button', { name: /delete review/i });
      expect(deleteBtn).toBeInTheDocument();

      fireEvent.click(deleteBtn);
      expect(handleDelete).toHaveBeenCalledTimes(1);
      expect(handleDelete).toHaveBeenCalledWith('rev-list-1');
    });
  });

  describe('<RecentReviewsCard />', () => {
    it('omits delete bin icon when user lacks reviews.delete capability', () => {
      mockCanDelete = false;

      render(
        <MemoryRouter>
          <RecentReviewsCard
            reviews={[sampleRecentReview]}
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

      expect(
        screen.queryByRole('button', { name: /delete review/i }),
      ).not.toBeInTheDocument();
    });

    it('renders delete bin icon when user holds reviews.delete capability', () => {
      mockCanDelete = true;
      const handleDelete = vi.fn();

      render(
        <MemoryRouter>
          <RecentReviewsCard
            reviews={[sampleRecentReview]}
            totalCount={1}
            query=""
            rating="all"
            onQueryChange={vi.fn()}
            onRatingChange={vi.fn()}
            deleting={false}
            onDelete={handleDelete}
          />
        </MemoryRouter>,
      );

      const deleteBtn = screen.getByRole('button', { name: /delete review/i });
      expect(deleteBtn).toBeInTheDocument();

      fireEvent.click(deleteBtn);
      expect(handleDelete).toHaveBeenCalledTimes(1);
      expect(handleDelete).toHaveBeenCalledWith('recent-rev-1');
    });
  });
});
