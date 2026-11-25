import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { UseQueryResult } from '@tanstack/react-query';
import {
  buildSidebarGroup,
  buildSidebarModule,
} from '@testing/builders/permission-set.builder';
import type * as PermissionsFeature from '@features/permissions';
import { AppSidebar } from './AppSidebar';

const { useMyPermissionModules } = vi.hoisted(() => ({
  useMyPermissionModules: vi.fn(),
}));

vi.mock('@features/permissions', async (importOriginal) => {
  const actual = await importOriginal<typeof PermissionsFeature>();
  return { ...actual, useMyPermissionModules };
});

const asQueryResult = <T,>(overrides: Partial<UseQueryResult<T>>): UseQueryResult<T> =>
  ({ data: undefined, isPending: false, ...overrides }) as UseQueryResult<T>;

describe('<AppSidebar />', () => {
  const noop = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders count badges for courses, tutorials, and resources when counts are greater than 0', () => {
    const groups = [
      buildSidebarGroup({
        id: 'learn',
        label: 'LEARN',
        items: [
          buildSidebarModule({
            id: 'courses',
            name: 'Courses',
            sidebarMenu: 'Courses',
            href: '/courses',
            icon: 'PlayCircle',
            count: 1,
          }),
          buildSidebarModule({
            id: 'tutorials',
            name: 'Tutorials',
            sidebarMenu: 'Tutorials',
            href: '/tutorials',
            icon: 'Lightbulb',
            count: 3,
          }),
          buildSidebarModule({
            id: 'resources',
            name: 'Resources',
            sidebarMenu: 'Resources',
            href: '/resources',
            icon: 'FolderOpen',
            count: 5,
          }),
        ],
      }),
    ];

    useMyPermissionModules.mockReturnValue(asQueryResult({ data: groups }));

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppSidebar open={false} collapsed={false} onNavigate={noop} />
      </MemoryRouter>,
    );

    // Verify labels are displayed
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.getByText('Tutorials')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();

    // Verify badges are rendered with counts and accessibility labels
    expect(screen.getByLabelText('1 new')).toHaveTextContent('1');
    expect(screen.getByLabelText('3 new')).toHaveTextContent('3');
    expect(screen.getByLabelText('5 new')).toHaveTextContent('5');
  });

  it('does not render count badge when count is 0 or null', () => {
    const groups = [
      buildSidebarGroup({
        id: 'learn',
        label: 'LEARN',
        items: [
          buildSidebarModule({
            id: 'courses',
            name: 'Courses',
            sidebarMenu: 'Courses',
            href: '/courses',
            icon: 'PlayCircle',
            count: 0,
          }),
          buildSidebarModule({
            id: 'tutorials',
            name: 'Tutorials',
            sidebarMenu: 'Tutorials',
            href: '/tutorials',
            icon: 'Lightbulb',
            count: null,
          }),
        ],
      }),
    ];

    useMyPermissionModules.mockReturnValue(asQueryResult({ data: groups }));

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppSidebar open={false} collapsed={false} onNavigate={noop} />
      </MemoryRouter>,
    );

    expect(screen.queryByLabelText(/new today/i)).not.toBeInTheDocument();
  });
});
