import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { buildResource } from '@testing/builders/resource.builder';
import { ResourceCardPreview } from './ResourceCardPreview';

const LocationProbe = (): ReactElement => {
  const location = useLocation();
  return <span data-testid="pathname">{location.pathname}</span>;
};

describe('<ResourceCardPreview />', () => {
  it('renders the title, subtitle, updated date, metadata, description, and CTA', () => {
    const resource = buildResource({
      title: 'Company Policy Manual',
      subtitle: 'Official guidelines and compliance requirements',
      category: 'Operations',
      description: 'Comprehensive guidelines for all corporate staff.',
      updated: new Date('2026-03-05T00:00:00.000Z'),
    });

    render(
      <MemoryRouter>
        <ResourceCardPreview resource={resource} side="right" />
      </MemoryRouter>,
    );

    expect(screen.getByText('Company Policy Manual')).toBeInTheDocument();
    expect(
      screen.getByText('Official guidelines and compliance requirements'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Updated/)).toBeInTheDocument();
    expect(screen.getByText(/Operations/)).toBeInTheDocument();
    expect(
      screen.getByText('Comprehensive guidelines for all corporate staff.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View resource/i })).toBeInTheDocument();
  });

  it('omits the subtitle when none is provided', () => {
    const resource = buildResource({
      title: 'Company Policy Manual',
      subtitle: null,
    });

    render(
      <MemoryRouter>
        <ResourceCardPreview resource={resource} side="left" />
      </MemoryRouter>,
    );

    expect(screen.getByText('Company Policy Manual')).toBeInTheDocument();
    expect(
      screen.queryByText('Official guidelines and compliance requirements'),
    ).not.toBeInTheDocument();
  });

  it('navigates to the resource detail page when CTA is clicked', () => {
    const resource = buildResource({ id: 'resource-55' });

    render(
      <MemoryRouter initialEntries={['/resources']}>
        <ResourceCardPreview resource={resource} side="right" />
        <LocationProbe />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /View resource/i }));

    expect(screen.getByTestId('pathname')).toHaveTextContent('/resources/resource-55');
  });
});
