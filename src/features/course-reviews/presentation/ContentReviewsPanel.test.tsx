import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Review } from '../domain';
import { ContentReviewsPanel } from './ContentReviewsPanel';

interface CapabilitiesMock {
  can: (module: string, cap: string) => boolean;
  isLoading: boolean;
}

interface CourseReviewsResultMock {
  isLoading: boolean;
  isError: boolean;
  data: readonly Review[];
}

const mockUseMyCapabilities = vi.fn<() => CapabilitiesMock>();
const mockUseCourseReviews =
  vi.fn<
    (contentId: string, options?: { enabled?: boolean }) => CourseReviewsResultMock
  >();

vi.mock('@features/auth', () => ({
  useAuth: () => ({
    user: { id: 'user-1', fullName: 'John Doe', userType: 'Learner' },
  }),
}));

vi.mock('@features/users', () => ({
  useMyCapabilities: (): CapabilitiesMock => mockUseMyCapabilities(),
}));

vi.mock('./use-course-reviews', () => ({
  useCourseReviews: (
    contentId: string,
    options?: { enabled?: boolean },
  ): CourseReviewsResultMock => mockUseCourseReviews(contentId, options),
  useSubmitReview: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
  useMarkReviewHelpful: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteReview: () => ({ mutate: vi.fn(), isPending: false }),
}));

const sampleReview = new Review({
  id: 'rev-1',
  contentId: 'content-1',
  contentName: 'Sample Content',
  userId: 'user-2',
  userName: 'Jane',
  userRole: 'Learner',
  rating: 5,
  feedback: 'Great content!',
  createdAt: new Date('2026-03-01T00:00:00Z'),
  helpful: 2,
  isHelpful: false,
});

describe('<ContentReviewsPanel /> permission enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when user lacks reviews.view capability', () => {
    mockUseMyCapabilities.mockReturnValue({
      can: (module: string, cap: string) => {
        if (module === 'reviews' && cap === 'view') return false;
        return true;
      },
      isLoading: false,
    });
    mockUseCourseReviews.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [sampleReview],
    });

    const { container } = render(
      <ContentReviewsPanel
        contentId="content-1"
        contentName="Sample Content"
        heading="Ratings & Reviews"
      />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(mockUseCourseReviews).toHaveBeenCalledWith('content-1', { enabled: false });
  });

  it('renders reviews panel and enables query when user has reviews.view capability', () => {
    mockUseMyCapabilities.mockReturnValue({
      can: (module: string, cap: string) => {
        if (module === 'reviews' && cap === 'view') return true;
        if (module === 'reviews' && cap === 'delete') return false;
        return false;
      },
      isLoading: false,
    });
    mockUseCourseReviews.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [sampleReview],
    });

    render(
      <ContentReviewsPanel
        contentId="content-1"
        contentName="Sample Content"
        heading="Ratings & Reviews"
      />,
    );

    expect(screen.getByText('Ratings & Reviews')).toBeInTheDocument();
    expect(screen.getByText('Great content!')).toBeInTheDocument();
    expect(mockUseCourseReviews).toHaveBeenCalledWith('content-1', { enabled: true });
    // Since delete capability is false, delete button is omitted
    expect(
      screen.queryByRole('button', { name: /delete review/i }),
    ).not.toBeInTheDocument();
  });

  it('enables review deletion when user has reviews.delete capability', () => {
    mockUseMyCapabilities.mockReturnValue({
      can: (module: string, cap: string) => {
        if (module === 'reviews' && cap === 'view') return true;
        if (module === 'reviews' && cap === 'delete') return true;
        return false;
      },
      isLoading: false,
    });
    mockUseCourseReviews.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [sampleReview],
    });

    render(
      <ContentReviewsPanel
        contentId="content-1"
        contentName="Sample Content"
        heading="Ratings & Reviews"
      />,
    );

    expect(screen.getByRole('button', { name: /delete review/i })).toBeInTheDocument();
  });
});
