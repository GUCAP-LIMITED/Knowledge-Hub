import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RatingStars } from './RatingStars';

describe('<RatingStars />', () => {
  it('renders 5 stars and handles 0 rating correctly', () => {
    const { container } = render(<RatingStars rating={0} />);

    expect(screen.getByText('0.0')).toBeInTheDocument();
    expect(screen.getByLabelText('Rated 0.0 out of 5 stars')).toBeInTheDocument();

    const filledStars = container.querySelectorAll('[data-star-state="filled"]');
    const emptyStars = container.querySelectorAll('[data-star-state="empty"]');
    expect(filledStars).toHaveLength(0);
    expect(emptyStars).toHaveLength(5);
  });

  it('renders filled and empty stars according to rating', () => {
    const { container } = render(<RatingStars rating={3.8} reviewCount={24} />);

    expect(screen.getByText('3.8')).toBeInTheDocument();
    expect(screen.getByText('(24)')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Rated 3.8 out of 5 stars (24 reviews)'),
    ).toBeInTheDocument();

    // 3.8 rounds to 4 filled stars, 1 empty star
    const filledStars = container.querySelectorAll('[data-star-state="filled"]');
    const emptyStars = container.querySelectorAll('[data-star-state="empty"]');
    expect(filledStars).toHaveLength(4);
    expect(emptyStars).toHaveLength(1);
  });

  it('clamps values above 5 and below 0', () => {
    const { container: containerHigh } = render(<RatingStars rating={10} />);
    expect(containerHigh.querySelectorAll('[data-star-state="filled"]')).toHaveLength(5);
    expect(screen.getByText('5.0')).toBeInTheDocument();

    const { container: containerLow } = render(<RatingStars rating={-2} />);
    expect(containerLow.querySelectorAll('[data-star-state="empty"]')).toHaveLength(5);
    expect(screen.getByText('0.0')).toBeInTheDocument();
  });
});
