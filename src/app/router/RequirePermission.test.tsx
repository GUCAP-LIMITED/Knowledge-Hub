import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { UseQueryResult } from '@tanstack/react-query';
import {
  buildSidebarGroup,
  buildSidebarModule,
} from '@testing/builders/permission-set.builder';
import type * as PermissionsFeature from '@features/permissions';
import { RequirePermission } from './RequirePermission';

const { useMyPermissionModules, useMyPermissions } = vi.hoisted(() => ({
  useMyPermissionModules: vi.fn(),
  useMyPermissions: vi.fn(),
}));

vi.mock('@features/permissions', async (importOriginal) => {
  const actual = await importOriginal<typeof PermissionsFeature>();
  return { ...actual, useMyPermissionModules, useMyPermissions };
});

const asQueryResult = <T,>(overrides: Partial<UseQueryResult<T>>): UseQueryResult<T> =>
  ({ data: undefined, isPending: false, ...overrides }) as UseQueryResult<T>;

const renderGuard = (path: string, initialEntry: string): void => {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<RequirePermission path={path} />}>
          <Route path={path} element={<div>Protected content</div>} />
        </Route>
        <Route path="/forbidden" element={<div>Forbidden page</div>} />
      </Routes>
    </MemoryRouter>,
  );
};

const renderAnyOfGuard = (anyOf: readonly string[], initialEntry: string): void => {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<RequirePermission anyOf={anyOf} />}>
          <Route path={initialEntry} element={<div>Protected content</div>} />
        </Route>
        <Route path="/forbidden" element={<div>Forbidden page</div>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('<RequirePermission />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a spinner while permission data is loading', () => {
    useMyPermissionModules.mockReturnValue(asQueryResult({ isPending: true }));
    useMyPermissions.mockReturnValue(asQueryResult({ isPending: true }));

    renderGuard('/teams', '/teams');

    expect(screen.getByLabelText('Checking access')).toBeInTheDocument();
  });

  it('renders the route when the sidebar-resolved permission is granted', () => {
    const groups = [
      buildSidebarGroup({
        items: [buildSidebarModule({ href: '/teams', basePermission: 'Team.Manage' })],
      }),
    ];
    useMyPermissionModules.mockReturnValue(asQueryResult({ data: groups }));
    useMyPermissions.mockReturnValue(asQueryResult({ data: { 'Team.Manage': true } }));

    renderGuard('/teams', '/teams');

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects to /forbidden when the sidebar-resolved permission is denied', () => {
    const groups = [
      buildSidebarGroup({
        items: [buildSidebarModule({ href: '/teams', basePermission: 'Team.Manage' })],
      }),
    ];
    useMyPermissionModules.mockReturnValue(asQueryResult({ data: groups }));
    useMyPermissions.mockReturnValue(asQueryResult({ data: { 'Team.Manage': false } }));

    renderGuard('/teams', '/teams');

    expect(screen.getByText('Forbidden page')).toBeInTheDocument();
  });

  it('resolves the section-specific permission for a dynamic /settings/:section route', () => {
    useMyPermissionModules.mockReturnValue(asQueryResult({ data: [] }));
    useMyPermissions.mockReturnValue(
      asQueryResult({ data: { 'Settings.View': true, 'Users.View': false } }),
    );

    renderGuard('/settings/:section', '/settings/users');

    expect(screen.getByText('Forbidden page')).toBeInTheDocument();
  });

  it('redirects /settings/users to /forbidden when Branches.ManageUsers is missing even if Users.View is true', () => {
    useMyPermissionModules.mockReturnValue(asQueryResult({ data: [] }));
    useMyPermissions.mockReturnValue(
      asQueryResult({
        data: {
          'Settings.View': true,
          'Users.View': true,
          'Branches.ManageUsers': false,
        },
      }),
    );

    renderGuard('/settings/:section', '/settings/users');

    expect(screen.getByText('Forbidden page')).toBeInTheDocument();
  });

  it('grants /settings/users when both Users.View and Branches.ManageUsers are true', () => {
    useMyPermissionModules.mockReturnValue(asQueryResult({ data: [] }));
    useMyPermissions.mockReturnValue(
      asQueryResult({
        data: { 'Settings.View': true, 'Users.View': true, 'Branches.ManageUsers': true },
      }),
    );

    renderGuard('/settings/:section', '/settings/users');

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('grants a dynamic /settings/:section route when its own section permission is true', () => {
    useMyPermissionModules.mockReturnValue(asQueryResult({ data: [] }));
    useMyPermissions.mockReturnValue(
      asQueryResult({ data: { 'Settings.View': false, 'Branches.View': true } }),
    );

    renderGuard('/settings/:section', '/settings/branches');

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('enforces Reviews.View for /reviews route override', () => {
    useMyPermissionModules.mockReturnValue(asQueryResult({ data: [] }));
    useMyPermissions.mockReturnValue(asQueryResult({ data: { 'Reviews.View': false } }));

    renderGuard('/reviews', '/reviews');

    expect(screen.getByText('Forbidden page')).toBeInTheDocument();
  });

  it('allows access to /reviews when Reviews.View is granted', () => {
    useMyPermissionModules.mockReturnValue(asQueryResult({ data: [] }));
    useMyPermissions.mockReturnValue(asQueryResult({ data: { 'Reviews.View': true } }));

    renderGuard('/reviews', '/reviews');

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('enforces CourseReviews.View for /course-reviews route override', () => {
    useMyPermissionModules.mockReturnValue(asQueryResult({ data: [] }));
    useMyPermissions.mockReturnValue(
      asQueryResult({ data: { 'Reviews.View': true, 'CourseReviews.View': false } }),
    );

    renderGuard('/course-reviews', '/course-reviews');

    expect(screen.getByText('Forbidden page')).toBeInTheDocument();
  });

  it('allows access to /course-reviews when CourseReviews.View is granted', () => {
    useMyPermissionModules.mockReturnValue(asQueryResult({ data: [] }));
    useMyPermissions.mockReturnValue(
      asQueryResult({ data: { 'Reviews.View': true, 'CourseReviews.View': true } }),
    );

    renderGuard('/course-reviews', '/course-reviews');

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('enforces MyLearning.View for /my-learning route override', () => {
    useMyPermissionModules.mockReturnValue(asQueryResult({ data: [] }));
    useMyPermissions.mockReturnValue(
      asQueryResult({ data: { 'Dashboard.View': true, 'MyLearning.View': false } }),
    );

    renderGuard('/my-learning', '/my-learning');

    expect(screen.getByText('Forbidden page')).toBeInTheDocument();
  });

  it('allows access to /my-learning when MyLearning.View is granted', () => {
    useMyPermissionModules.mockReturnValue(asQueryResult({ data: [] }));
    useMyPermissions.mockReturnValue(
      asQueryResult({ data: { 'Dashboard.View': true, 'MyLearning.View': true } }),
    );

    renderGuard('/my-learning', '/my-learning');

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('allows access to /my-learning with case-insensitive permission key grant', () => {
    useMyPermissionModules.mockReturnValue(asQueryResult({ data: [] }));
    useMyPermissions.mockReturnValue(
      asQueryResult({ data: { 'mylearning.view': true } }),
    );

    renderGuard('/my-learning', '/my-learning');

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('grants an anyOf detail route when the user holds MyLearning.View only', () => {
    useMyPermissionModules.mockReturnValue(asQueryResult({ data: [] }));
    useMyPermissions.mockReturnValue(
      asQueryResult({ data: { 'Courses.View': false, 'MyLearning.View': true } }),
    );

    renderAnyOfGuard(['Courses.View', 'MyLearning.View'], '/courses/item-1');

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('denies an anyOf detail route when none of the permissions are held', () => {
    useMyPermissionModules.mockReturnValue(asQueryResult({ data: [] }));
    useMyPermissions.mockReturnValue(
      asQueryResult({ data: { 'Courses.View': false, 'MyLearning.View': false } }),
    );

    renderAnyOfGuard(['Courses.View', 'MyLearning.View'], '/courses/item-1');

    expect(screen.getByText('Forbidden page')).toBeInTheDocument();
  });

  it('fails closed and warns when no permission mapping resolves for the route', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    useMyPermissionModules.mockReturnValue(asQueryResult({ data: [] }));
    useMyPermissions.mockReturnValue(asQueryResult({ data: {} }));

    renderGuard('/some-unmapped-route', '/some-unmapped-route');

    expect(screen.getByText('Forbidden page')).toBeInTheDocument();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('No permission mapping found for route'),
      expect.objectContaining({ path: '/some-unmapped-route' }),
    );
  });
});
