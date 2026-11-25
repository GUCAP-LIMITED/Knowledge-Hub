import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelpfulVoteButton } from './HelpfulVoteButton';

describe('<HelpfulVoteButton />', () => {
  it('renders neutral state and triggers vote on click', () => {
    const handleVote = vi.fn();
    render(
      <HelpfulVoteButton
        isHelpful={false}
        helpfulCount={3}
        isPending={false}
        onVote={handleVote}
      />,
    );

    expect(screen.getByText('Did you find this helpful?')).toBeInTheDocument();
    expect(screen.getByText('Yes, this was helpful')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    const button = screen.getByRole('button', { name: 'Mark as helpful' });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(button);
    expect(handleVote).toHaveBeenCalledTimes(1);
  });

  it('renders active state when already marked helpful', () => {
    render(
      <HelpfulVoteButton
        isHelpful={true}
        helpfulCount={4}
        isPending={false}
        onVote={vi.fn()}
      />,
    );

    expect(screen.getByText('You found this helpful')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: 'Remove helpful vote' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('disables button during pending state', () => {
    render(
      <HelpfulVoteButton
        isHelpful={false}
        helpfulCount={0}
        isPending={true}
        onVote={vi.fn()}
      />,
    );

    const button = screen.getByRole('button', { name: 'Mark as helpful' });
    expect(button).toBeDisabled();
  });
});
