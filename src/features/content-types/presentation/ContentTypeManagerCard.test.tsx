import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KIND_META } from './content-types-model';
import { ContentTypeManagerCard } from './ContentTypeManagerCard';

let grants: readonly string[] = [];

vi.mock('@features/users', () => ({
  useMyCapabilities: () => ({
    can: (module: string, cap: string) => grants.includes(`${module}.${cap}`),
  }),
}));

const renderCard = (): void => {
  render(
    <ContentTypeManagerCard
      kind="course"
      meta={KIND_META.course}
      types={['Onboarding']}
      query=""
      onAdd={vi.fn()}
      onRequestRemove={vi.fn()}
    />,
  );
};

describe('<ContentTypeManagerCard /> permission gating', () => {
  beforeEach(() => {
    grants = [];
  });

  it('hides add row and remove control without grants', () => {
    renderCard();

    expect(screen.getByText('Onboarding')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /remove onboarding/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add/i })).not.toBeInTheDocument();
  });

  it('shows remove control with content-types.delete', () => {
    grants = ['content-types.delete'];
    renderCard();

    expect(
      screen.getByRole('button', { name: /remove onboarding/i }),
    ).toBeInTheDocument();
  });

  it('shows add row with content-types.create', () => {
    grants = ['content-types.create'];
    renderCard();

    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });
});
