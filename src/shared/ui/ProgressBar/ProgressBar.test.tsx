import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('<ProgressBar />', () => {
  it('does not render label when showLabel is not provided or false', () => {
    render(<ProgressBar value={50} />);
    expect(screen.queryByText('50% complete')).not.toBeInTheDocument();
  });

  it('renders "Completed" when progress is 100% and showLabel is true', () => {
    render(<ProgressBar value={100} showLabel />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.queryByText('100% complete')).not.toBeInTheDocument();
  });

  it('renders "Completed" when value exceeds 100 (clamped)', () => {
    render(<ProgressBar value={120} showLabel />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders "% complete" when progress is below 100%', () => {
    const { rerender } = render(<ProgressBar value={0} showLabel />);
    expect(screen.getByText('0% complete')).toBeInTheDocument();

    rerender(<ProgressBar value={33} showLabel />);
    expect(screen.getByText('33% complete')).toBeInTheDocument();

    rerender(<ProgressBar value={75} showLabel />);
    expect(screen.getByText('75% complete')).toBeInTheDocument();
  });

  it('clamps negative values to 0% complete', () => {
    render(<ProgressBar value={-10} showLabel />);
    expect(screen.getByText('0% complete')).toBeInTheDocument();
  });
});
