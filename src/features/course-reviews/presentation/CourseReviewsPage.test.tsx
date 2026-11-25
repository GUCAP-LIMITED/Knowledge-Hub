import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CourseReviewStatistics, type RecentReview } from '../domain';
import { CourseReviewsPage } from './CourseReviewsPage';

interface CapabilitiesMock {
  can: (module: string, cap: string) => boolean;
  isLoading: boolean;
}

interface StatisticsResultMock {
  isLoading: boolean;
  isError: boolean;
  data: CourseReviewStatistics;
}

interface RecentReviewsResultMock {
  isLoading: boolean;
  isError: boolean;
  data: { items: readonly RecentReview[]; totalCount: number };
}

const mockStats = new CourseReviewStatistics({
  totalReviews: 12,
  averageRating: 4.8,
  totalRatedCourses: 4,
  totalHelpfulVotes: 20,
  ratingBreakdown: {
    fiveStars: 10,
    fourStars: 2,
    threeStars: 0,
    twoStars: 0,
    oneStar: 0,
  },
  topRatedCourses: [],
});

const mockUseMyCapabilities = vi.fn<() => CapabilitiesMock>();
const mockUseCourseReviewStatistics = vi.fn<() => StatisticsResultMock>();
const mockUseRecentReviews = vi.fn<(query: unknown) => RecentReviewsResultMock>();

vi.mock('@features/users', () => ({
  useMyCapabilities: (): CapabilitiesMock => mockUseMyCapabilities(),
}));

vi.mock('./use-course-reviews', () => ({
  useCourseReviewStatistics: (): StatisticsResultMock => mockUseCourseReviewStatistics(),
  useRecentReviews: (): RecentReviewsResultMock => mockUseRecentReviews(undefined),
  useDeleteReview: () => ({ mutate: vi.fn(), isPending: false }),
}));

describe('<CourseReviewsPage /> permission enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Access Denied alert when user lacks course-reviews.view capability', () => {
    mockUseMyCapabilities.mockReturnValue({
      can: (module: string, cap: string) => {
        if (module === 'course-reviews' && cap === 'view') return false;
        return true;
      },
      isLoading: false,
    });
    mockUseCourseReviewStatistics.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockStats,
    });
    mockUseRecentReviews.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { items: [], totalCount: 0 },
    });

    render(
      <MemoryRouter>
        <CourseReviewsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(
      screen.getByText('You do not have permission to view course reviews.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Total Reviews')).not.toBeInTheDocument();
  });

  it('renders full dashboard when user has course-reviews.view capability', () => {
    mockUseMyCapabilities.mockReturnValue({
      can: (module: string, cap: string) => {
        if (module === 'course-reviews' && cap === 'view') return true;
        if (module === 'reviews' && cap === 'delete') return false;
        return true;
      },
      isLoading: false,
    });
    mockUseCourseReviewStatistics.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockStats,
    });
    mockUseRecentReviews.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { items: [], totalCount: 0 },
    });

    render(
      <MemoryRouter>
        <CourseReviewsPage />
      </MemoryRouter>,
    );

    expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Course Reviews' })).toBeInTheDocument();
    expect(screen.getByText('Total Reviews')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });
});
