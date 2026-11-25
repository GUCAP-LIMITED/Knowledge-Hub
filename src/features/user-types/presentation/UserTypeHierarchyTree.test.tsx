import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserTypeHierarchyNode } from '../domain';
import { UserTypeHierarchyTree } from './UserTypeHierarchyTree';

let canDelete = true;
let canEdit = true;

vi.mock('@features/users', () => ({
  useMyCapabilities: () => ({
    can: (_module: string, cap: string) =>
      (cap === 'delete' && canDelete) || (cap === 'edit' && canEdit),
  }),
}));

const sampleNodes: UserTypeHierarchyNode[] = [
  {
    userTypeId: 'ut-1',
    userTypeName: 'System Admin',
    hierarchyLevel: 14,
    canLogin: true,
    reportsTo: 'Top of Hierarchy',
    reports: [],
  },
  {
    userTypeId: 'ut-2',
    userTypeName: 'Admin',
    hierarchyLevel: 13,
    canLogin: false,
    reportsTo: 'Reports to System Admin',
    reports: [],
  },
];

describe('<UserTypeHierarchyTree />', () => {
  beforeEach(() => {
    canDelete = true;
    canEdit = true;
  });

  it('renders hierarchy nodes with badges and reports info', () => {
    render(
      <UserTypeHierarchyTree
        flatNodes={sampleNodes}
        selectedInsertIndex={null}
        onSelectInsertIndex={vi.fn()}
        newRoleName=""
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('System Admin')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Login: Allowed')).toBeInTheDocument();
    expect(screen.getByText('Login: Disallowed')).toBeInTheDocument();
    expect(screen.getByText(/Level 14 • Top of Hierarchy/)).toBeInTheDocument();
  });

  it('handles insertion slot selection', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <UserTypeHierarchyTree
        flatNodes={sampleNodes}
        selectedInsertIndex={0}
        onSelectInsertIndex={onSelect}
        newRoleName="Compliance Lead"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('"Compliance Lead" inserted here')).toBeInTheDocument();

    const insertEndBtn = screen.getByText(/Insert between Admin/);
    await user.click(insertEndBtn);

    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('triggers onEdit and onDelete callbacks', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const user = userEvent.setup();

    render(
      <UserTypeHierarchyTree
        flatNodes={sampleNodes}
        selectedInsertIndex={null}
        onSelectInsertIndex={vi.fn()}
        newRoleName=""
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    // Apex node (System Admin) cannot be edited
    expect(
      screen.queryByRole('button', { name: /edit system admin/i }),
    ).not.toBeInTheDocument();

    const editAdminBtn = screen.getByRole('button', { name: /edit admin/i });
    await user.click(editAdminBtn);
    expect(onEdit).toHaveBeenCalledWith(sampleNodes[1]);

    const deleteBtns = screen.getAllByRole('button', { name: /delete/i });
    const firstDelete = deleteBtns[0];
    expect(firstDelete).toBeDefined();
    if (firstDelete !== undefined) {
      await user.click(firstDelete);
    }
    expect(onDelete).toHaveBeenCalledWith(sampleNodes[0]);
  });

  it('renders editing badge and active state when activeEditId is set', () => {
    render(
      <UserTypeHierarchyTree
        flatNodes={sampleNodes}
        selectedInsertIndex={null}
        onSelectInsertIndex={vi.fn()}
        newRoleName=""
        activeEditId="ut-1"
        editingRoleName="System Admin"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('Editing')).toBeInTheDocument();
    // Slots in edit mode say "Move between..." instead of "Insert between..."
    expect(screen.getByText(/Move between System Admin/)).toBeInTheDocument();
  });

  it('hides delete button for default seeded nodes', () => {
    const nodesWithDefault: UserTypeHierarchyNode[] = [
      {
        userTypeId: 'ut-1',
        userTypeName: 'System Admin',
        hierarchyLevel: 14,
        canLogin: true,
        isDefault: true,
        reportsTo: 'Top of Hierarchy',
        reports: [],
      },
      {
        userTypeId: 'ut-2',
        userTypeName: 'Student Mentor',
        hierarchyLevel: 13,
        canLogin: true,
        isDefault: false,
        reportsTo: 'Reports to System Admin',
        reports: [],
      },
    ];

    render(
      <UserTypeHierarchyTree
        flatNodes={nodesWithDefault}
        selectedInsertIndex={null}
        onSelectInsertIndex={vi.fn()}
        newRoleName=""
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    // Only Student Mentor has a delete button; System Admin does not
    expect(
      screen.queryByRole('button', { name: /delete system admin/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /delete student mentor/i }),
    ).toBeInTheDocument();
  });

  it('disables repositioning slots when apex role is editing', () => {
    render(
      <UserTypeHierarchyTree
        flatNodes={sampleNodes}
        selectedInsertIndex={null}
        onSelectInsertIndex={vi.fn()}
        newRoleName=""
        activeEditId="ut-1"
        editingRoleName="System Admin"
        isApexRoleEditing={true}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const moveBtns = screen.getAllByRole('button', { name: /move between/i });
    expect(moveBtns[0]).toBeDisabled();
  });
});
