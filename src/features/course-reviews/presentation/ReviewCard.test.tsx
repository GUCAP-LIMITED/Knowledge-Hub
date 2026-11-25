import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Review } from '../domain';
import { ReviewCard } from './ReviewCard';

let mockCanDelete = false;

vi.mock('@features/users', () => ({
  useMyCapabilities: () => ({
    can: (module: string, cap: string) =>
      module === 'reviews' && cap === 'delete' && mockCanDelete,
  }),
}));

const createReview = (
  overrides?: Partial<ConstructorParameters<typeof Review>[0]>,
): Review =>
  new Review({
    id: 'rev-1',
    contentId: 'course-1',
    contentName: 'Clean Architecture',
    userId: 'user-author',
    userName: 'John Doe',
    userRole: 'Learner',
    rating: 5,
    feedback: 'Great course!',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    helpful: 2,
    isHelpful: false,
    ...overrides,
  });

describe('<ReviewCard />', () => {
  beforeEach(() => {
    mockCanDelete = false;
  });
  it('omits helpful button when viewing own review and displays count if > 0', () => {
    const handleHelpful = vi.fn();
    const review = createReview({ userId: 'current-user', helpful: 3 });

    render(
      <ReviewCard
        review={review}
        currentUserId="current-user"
        onHelpful={handleHelpful}
      />,
    );

    expect(screen.queryByRole('button', { name: /helpful/i })).not.toBeInTheDocument();
    expect(screen.getByText('3 found this helpful')).toBeInTheDocument();
  });

  it('omits helpful button and text when viewing own review with 0 helpful votes', () => {
    const review = createReview({ userId: 'current-user', helpful: 0 });

    render(
      <ReviewCard review={review} currentUserId="current-user" onHelpful={vi.fn()} />,
    );

    expect(screen.queryByRole('button', { name: /helpful/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/found this helpful/i)).not.toBeInTheDocument();
  });

  it('renders helpful button and triggers callback when clicked by another user', () => {
    const handleHelpful = vi.fn();
    const review = createReview({ userId: 'author-user', helpful: 2, isHelpful: false });

    render(
      <ReviewCard review={review} currentUserId="other-user" onHelpful={handleHelpful} />,
    );

    const button = screen.getByRole('button', { name: /Helpful \(2\)/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(button);
    expect(handleHelpful).toHaveBeenCalledTimes(1);
    expect(handleHelpful).toHaveBeenCalledWith('rev-1', false);
  });

  it('triggers callback with isHelpful true when unvoting an already-voted review', () => {
    const handleHelpful = vi.fn();
    const review = createReview({ userId: 'author-user', helpful: 3, isHelpful: true });

    render(
      <ReviewCard review={review} currentUserId="other-user" onHelpful={handleHelpful} />,
    );

    const button = screen.getByRole('button', { name: /Helpful \(3\)/i });
    fireEvent.click(button);
    expect(handleHelpful).toHaveBeenCalledWith('rev-1', true);
  });

  it('renders active state with aria-pressed="true" when isHelpful is true', () => {
    const review = createReview({ userId: 'author-user', helpful: 5, isHelpful: true });

    render(<ReviewCard review={review} currentUserId="other-user" onHelpful={vi.fn()} />);

    const button = screen.getByRole('button', { name: /Helpful \(5\)/i });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAttribute('title', 'Remove helpful vote');
  });

  it('disables helpful button and prompts sign in when user is not logged in', () => {
    const review = createReview({ userId: 'author-user', helpful: 1 });

    render(<ReviewCard review={review} currentUserId={undefined} onHelpful={vi.fn()} />);

    const button = screen.getByRole('button', { name: /Helpful \(1\)/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('title', 'Sign in to vote helpful');
  });

  it('disables helpful button when canVoteHelpful is false', () => {
    const review = createReview({ userId: 'author-user', helpful: 1 });

    render(
      <ReviewCard
        review={review}
        currentUserId="other-user"
        canVoteHelpful={false}
        onHelpful={vi.fn()}
      />,
    );

    const button = screen.getByRole('button', { name: /Helpful \(1\)/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute(
      'title',
      'Only enrolled learners who completed this content can vote',
    );
  });

  it('disables helpful button when helpfulBusy is true', () => {
    const review = createReview({ userId: 'author-user', helpful: 1 });

    render(
      <ReviewCard
        review={review}
        currentUserId="other-user"
        helpfulBusy={true}
        onHelpful={vi.fn()}
      />,
    );

    const button = screen.getByRole('button', { name: /Helpful \(1\)/i });
    expect(button).toBeDisabled();
  });

  it('omits delete bin icon when user does not have reviews.delete permission', () => {
    mockCanDelete = false;
    const review = createReview();

    render(<ReviewCard review={review} onDelete={vi.fn()} />);

    expect(
      screen.queryByRole('button', { name: /delete review/i }),
    ).not.toBeInTheDocument();
  });

  it('renders delete bin icon when user has reviews.delete permission and onDelete is provided', () => {
    mockCanDelete = true;
    const review = createReview();

    render(<ReviewCard review={review} onDelete={vi.fn()} />);

    expect(screen.getByRole('button', { name: /delete review/i })).toBeInTheDocument();
  });

  it('omits delete bin icon when canDelete is explicitly overridden to false', () => {
    mockCanDelete = true;
    const review = createReview();

    render(<ReviewCard review={review} canDelete={false} onDelete={vi.fn()} />);

    expect(
      screen.queryByRole('button', { name: /delete review/i }),
    ).not.toBeInTheDocument();
  });

  it('renders delete bin icon when canDelete is explicitly overridden to true', () => {
    mockCanDelete = false;
    const review = createReview();

    render(<ReviewCard review={review} canDelete={true} onDelete={vi.fn()} />);

    expect(screen.getByRole('button', { name: /delete review/i })).toBeInTheDocument();
  });

  it('triggers onDelete callback when delete bin icon is clicked', () => {
    const handleDelete = vi.fn();
    const review = createReview({ id: 'target-review-id' });

    render(<ReviewCard review={review} canDelete={true} onDelete={handleDelete} />);

    const deleteBtn = screen.getByRole('button', { name: /delete review/i });
    fireEvent.click(deleteBtn);

    expect(handleDelete).toHaveBeenCalledTimes(1);
    expect(handleDelete).toHaveBeenCalledWith('target-review-id');
  });

  it('disables delete bin icon when deleteBusy is true', () => {
    const review = createReview();

    render(
      <ReviewCard
        review={review}
        canDelete={true}
        onDelete={vi.fn()}
        deleteBusy={true}
      />,
    );

    const deleteBtn = screen.getByRole('button', { name: /delete review/i });
    expect(deleteBtn).toBeDisabled();
  });
});
