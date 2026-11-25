import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Lightbulb } from 'lucide-react';
import { CatalogCounterRow } from './CatalogCounterRow';

describe('<CatalogCounterRow />', () => {
  it('renders a skeleton placeholder while loading', () => {
    const { container } = render(
      <CatalogCounterRow
        count={0}
        isLoading={true}
        filtered={false}
        singular="tutorial"
        plural="tutorials"
      />,
    );

    const skeleton = container.querySelector('span[style*="border-radius"]');
    expect(skeleton).toBeInTheDocument();
    expect(screen.queryByText(/tutorial/i)).not.toBeInTheDocument();
  });

  it('renders singular noun when count is 1 and unfiltered', () => {
    render(
      <CatalogCounterRow
        count={1}
        isLoading={false}
        filtered={false}
        singular="tutorial"
        plural="tutorials"
        icon={Lightbulb}
      />,
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(/tutorial available/i)).toBeInTheDocument();
  });

  it('renders plural noun when count is multiple and unfiltered', () => {
    render(
      <CatalogCounterRow
        count={8}
        isLoading={false}
        filtered={false}
        singular="resource"
        plural="resources"
      />,
    );

    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText(/resources available/i)).toBeInTheDocument();
  });

  it('renders "found" when filtered is true', () => {
    render(
      <CatalogCounterRow
        count={3}
        isLoading={false}
        filtered={true}
        singular="tutorial"
        plural="tutorials"
      />,
    );

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText(/tutorials found/i)).toBeInTheDocument();
  });

  it('renders "0 tutorials found" when filtered returns zero matches', () => {
    render(
      <CatalogCounterRow
        count={0}
        isLoading={false}
        filtered={true}
        singular="tutorial"
        plural="tutorials"
      />,
    );

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText(/tutorials found/i)).toBeInTheDocument();
  });

  it('formats large numbers with locale comma separators', () => {
    render(
      <CatalogCounterRow
        count={2500}
        isLoading={false}
        filtered={false}
        singular="resource"
        plural="resources"
      />,
    );

    expect(screen.getByText('2,500')).toBeInTheDocument();
    expect(screen.getByText(/resources available/i)).toBeInTheDocument();
  });
});
