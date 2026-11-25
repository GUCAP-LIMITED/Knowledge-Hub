import type { ReactElement } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { Spinner } from '@shared/ui';
import { ConsoleLogger } from '@core/logger';
import {
  buildRoutePermissionLookup,
  hasPermissionGrant,
  useMyPermissionModules,
  useMyPermissions,
} from '@features/permissions';

// Diagnostic-only: surfaces a route/sidebar mapping gap in every environment's console. Fixed at
// 'warn' rather than reading env config — this file has no DI path to the composition-root logger.
const logger = new ConsoleLogger('warn', 'require-permission');

/**
 * `/settings/:section` fans out to distinct backend permissions per section — the sidebar only
 * carries one generic `Settings.View` entry, so the actual `:section` param (read at render time)
 * is resolved through this table instead. Unmatched/absent section (bare `/settings` before its
 * redirect) falls back to `Settings.View`.
 */
const SETTINGS_SECTION_PERMISSIONS: Readonly<Record<string, string | readonly string[]>> =
  {
    platform: 'Settings.Edit',
    'content-types': 'Categories.View',
    certificates: 'Certificates.ManageTemplates',
    users: ['Users.View', 'Branches.ManageUsers'],
    permissions: 'Users.ChangePermissions',
    dashboards: 'Dashboard.Manage',
    templates: 'Templates.View',
    'email-templates': 'Templates.View',
    branches: 'Branches.View',
    countries: 'Countries.View',
  };

/**
 * Routes whose real requirement is stricter than (or independent of) the sidebar's
 * `basePermission`. `/course-reviews` shares the sidebar's `Reviews.View` module with `/reviews`,
 * but it's an admin moderation view and needs the stricter `Reviews.Moderate`.
 */
const ROUTE_PERMISSION_OVERRIDES: Readonly<Record<string, string>> = {
  '/reviews': 'Reviews.View',
  '/course-reviews': 'CourseReviews.View',
  '/my-learning': 'MyLearning.View',
};

type PermissionModules = ReturnType<typeof useMyPermissionModules>['data'];
type PermissionGrants = ReturnType<typeof useMyPermissions>['data'];

/** `undefined` means "no anyOf rule was supplied", not "denied". */
const resolveAnyOfGrant = (
  anyOf: readonly string[] | undefined,
  permissions: PermissionGrants,
): boolean | undefined => {
  if (anyOf === undefined || anyOf.length === 0) {
    return undefined;
  }
  return anyOf.some((required) => hasPermissionGrant(permissions, required));
};

const resolveRequiredPermission = (
  path: string | undefined,
  section: string | undefined,
  groups: PermissionModules,
): string | readonly string[] | undefined => {
  if (section !== undefined) {
    return SETTINGS_SECTION_PERMISSIONS[section] ?? 'Settings.View';
  }
  if (path === undefined) {
    return undefined;
  }
  return (
    ROUTE_PERMISSION_OVERRIDES[path] ??
    buildRoutePermissionLookup(groups ?? [], [path]).get(path)
  );
};

export interface RequirePermissionProps {
  readonly path?: string;
  /** Grants access when the caller holds ANY of these permissions (detail routes). */
  readonly anyOf?: readonly string[];
  readonly redirectTo?: string;
}

/**
 * Capability route guard driven purely by the live permissions API — the same `basePermission`
 * data that powers the sidebar (`GET /api/app/my/permission-modules`), cross-checked against the
 * flat grant map (`GET /api/app/my/permissions`). No client-side role check is involved.
 *
 * While permission data is still loading (e.g. a hard refresh), it shows a spinner rather than
 * deciding — otherwise the check would read as denied mid-load and bounce the user to `/forbidden`.
 */
export const RequirePermission = ({
  path,
  anyOf,
  redirectTo = '/forbidden',
}: RequirePermissionProps): ReactElement => {
  const { data: groups, isPending: modulesPending } = useMyPermissionModules();
  const { data: permissions, isPending: permissionsPending } = useMyPermissions();
  const { section } = useParams<{ readonly section?: string }>();

  if (modulesPending || permissionsPending) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <Spinner size="lg" label="Checking access" />
      </div>
    );
  }

  const anyOfGranted = resolveAnyOfGrant(anyOf, permissions);
  if (anyOfGranted !== undefined) {
    return anyOfGranted ? <Outlet /> : <Navigate to={redirectTo} replace />;
  }

  const requiredPermission = resolveRequiredPermission(path, section, groups);

  if (requiredPermission === undefined) {
    logger.warn('No permission mapping found for route', { path });
    return <Navigate to={redirectTo} replace />;
  }

  const requiredList: readonly string[] =
    typeof requiredPermission === 'string' ? [requiredPermission] : requiredPermission;

  const isGranted = requiredList.every((required) =>
    hasPermissionGrant(permissions, required),
  );

  return isGranted ? <Outlet /> : <Navigate to={redirectTo} replace />;
};
