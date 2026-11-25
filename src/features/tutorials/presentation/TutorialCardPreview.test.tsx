import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { buildTutorial } from '@testing';
import { TutorialCardPreview } from './TutorialCardPreview';

const LocationProbe = (): ReactElement => {
  const location = useLocation();
  return <span data-testid="pathname">{location.pathname}</span>;
};

describe('<TutorialCardPreview />', () => {
  it('renders the title, subtitle, updated date, metadata, description, and CTA', () => {
    const tutorial = buildTutorial({
      title: 'Adding a Student Record',
      subtitle: 'Complete step-by-step workflow guide',
      description: 'Create and enrol a new student record quickly.',
      duration: '10 min',
      difficulty: 'Intermediate',
      updatedAt: new Date('2026-03-05T00:00:00.000Z'),
    });

    render(
      <MemoryRouter>
        <TutorialCardPreview tutorial={tutorial} side="right" />
      </MemoryRouter>,
    );

    expect(screen.getByText('Adding a Student Record')).toBeInTheDocument();
    expect(screen.getByText('Complete step-by-step workflow guide')).toBeInTheDocument();
    expect(screen.getByText(/Updated/)).toBeInTheDocument();
    expect(screen.getByText('10 min · Intermediate')).toBeInTheDocument();
    expect(
      screen.getByText('Create and enrol a new student record quickly.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Watch tutorial/i })).toBeInTheDocument();
  });

  it('omits the subtitle when none is provided', () => {
    const tutorial = buildTutorial({
      title: 'Adding a Student Record',
      subtitle: null,
    });

    render(
      <MemoryRouter>
        <TutorialCardPreview tutorial={tutorial} side="left" />
      </MemoryRouter>,
    );

    expect(screen.getByText('Adding a Student Record')).toBeInTheDocument();
    expect(
      screen.queryByText('Complete step-by-step workflow guide'),
    ).not.toBeInTheDocument();
  });

  it('navigates to the tutorial detail page when CTA is clicked', () => {
    const tutorial = buildTutorial({ id: 'tutorial-99' });

    render(
      <MemoryRouter initialEntries={['/tutorials']}>
        <TutorialCardPreview tutorial={tutorial} side="right" />
        <LocationProbe />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Watch tutorial/i }));

    expect(screen.getByTestId('pathname')).toHaveTextContent('/tutorials/tutorial-99');
  });
});
