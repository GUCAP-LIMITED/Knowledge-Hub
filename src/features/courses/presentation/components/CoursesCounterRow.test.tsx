import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CoursesCounterRow } from './CoursesCounterRow';

describe('<CoursesCounterRow />', () => {
  it('renders a skeleton shimmer placeholder while loading', () => {
    const { container } = render(
      <CoursesCounterRow count={0} isLoading={true} filtered={false} />,
    );

    const skeleton = container.querySelector('span[style*="border-radius"]');
    expect(skeleton).toBeInTheDocument();
    expect(screen.queryByText(/course/i)).not.toBeInTheDocument();
  });

  it('renders singular "1 course available" when count is 1 and unfiltered', () => {
    render(<CoursesCounterRow count={1} isLoading={false} filtered={false} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(/course available/i)).toBeInTheDocument();
  });

  it('renders plural "4 courses available" when count is multiple and unfiltered', () => {
    render(<CoursesCounterRow count={4} isLoading={false} filtered={false} />);

    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText(/courses available/i)).toBeInTheDocument();
  });

  it('renders "2 courses found" when filtered is true', () => {
    render(<CoursesCounterRow count={2} isLoading={false} filtered={true} />);

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/courses found/i)).toBeInTheDocument();
  });

  it('renders "0 courses found" when filtered returns zero matches', () => {
    render(<CoursesCounterRow count={0} isLoading={false} filtered={true} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText(/courses found/i)).toBeInTheDocument();
  });

  it('formats large numbers with locale comma separators', () => {
    render(<CoursesCounterRow count={1250} isLoading={false} filtered={false} />);

    expect(screen.getByText('1,250')).toBeInTheDocument();
    expect(screen.getByText(/courses available/i)).toBeInTheDocument();
  });
});
