import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { TooltipProvider } from '@shared/ui';
import { buildAssignment } from '@testing/builders/assignment.builder';
import { AssignmentCard, type AssignmentCardProps } from './AssignmentCard';

let mockCanDelete = true;

vi.mock('@features/users', () => ({
  useMyCapabilities: () => ({
    can: (module: string, cap: string) =>
      module === 'assign' && cap === 'delete' && mockCanDelete,
  }),
}));

const renderCard = (props: Partial<AssignmentCardProps> = {}): ReactElement => {
  const assignment = props.assignment ?? buildAssignment();
  const deleting = props.deleting ?? false;
  const onView = props.onView ?? vi.fn();
  const onDelete = props.onDelete ?? vi.fn();

  return (
    <TooltipProvider>
      <AssignmentCard
        assignment={assignment}
        deleting={deleting}
        onView={onView}
        onDelete={onDelete}
      />
    </TooltipProvider>
  );
};

describe('<AssignmentCard />', () => {
  beforeEach(() => {
    mockCanDelete = true;
  });

  it('shows the more-actions menu when the user holds assign.delete', () => {
    render(renderCard());

    expect(screen.getByRole('button', { name: /more actions/i })).toBeInTheDocument();
  });

  it('hides the more-actions menu when the user lacks assign.delete', () => {
    mockCanDelete = false;

    render(renderCard());

    expect(
      screen.queryByRole('button', { name: /more actions/i }),
    ).not.toBeInTheDocument();
  });

  it('renders "None" when assignees list is empty', () => {
    const assignment = buildAssignment({ assignees: [] });

    render(renderCard({ assignment }));

    expect(screen.getByText('None')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /remaining assignees/i }),
    ).not.toBeInTheDocument();
  });

  it('renders single assignee name without three-dot trigger', () => {
    const assignment = buildAssignment({
      assignees: [
        { category: 'team', targetId: 'team-design', displayName: 'Design Team' },
      ],
    });

    render(renderCard({ assignment }));

    expect(screen.getByText('Design Team')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /remaining assignees/i }),
    ).not.toBeInTheDocument();
  });

  it('renders first assignee and 3-dot button when multiple assignees exist', () => {
    const assignment = buildAssignment({
      assignees: [
        { category: 'team', targetId: 'team-eng', displayName: 'Engineering Team' },
        { category: 'team', targetId: 'team-des', displayName: 'Design Team' },
        { category: 'userType', targetId: 'ut-cons', displayName: 'Consultants' },
      ],
    });

    render(renderCard({ assignment }));

    expect(screen.getByText('Engineering Team')).toBeInTheDocument();

    const trigger = screen.getByRole('button', {
      name: 'Remaining assignees: Design Team, Consultants',
    });
    expect(trigger).toBeInTheDocument();
  });

  it('triggers onView callback when View progress button is clicked', async () => {
    const user = userEvent.setup();
    const onView = vi.fn();
    const assignment = buildAssignment();

    render(renderCard({ assignment, onView }));

    const viewButton = screen.getByRole('button', { name: /view progress/i });
    await user.click(viewButton);

    expect(onView).toHaveBeenCalledWith(assignment);
  });
});
