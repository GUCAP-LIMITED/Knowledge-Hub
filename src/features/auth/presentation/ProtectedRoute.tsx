import type { ReactElement } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Spinner } from '@shared/ui';
import { useAuth } from './use-auth';

export interface ProtectedRouteProps {
  /** Optional role gate — user must hold at least one of these roles. */
  readonly anyOf?: readonly string[];
  readonly redirectTo?: string;
}

/**
 * Route guard. Renders the matched child route only for an authenticated (and, optionally,
 * suitably-authorized) user; otherwise redirects to sign-in. Keeping this in one place means no
 * page re-implements the "am I allowed here?" check.
 */
export const ProtectedRoute = ({
  anyOf,
  redirectTo = '/login',
}: ProtectedRouteProps): ReactElement => {
  const { status, user } = useAuth();

  if (status === 'initializing') {
    return (
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Spinner size="lg" label="Restoring your session" />
      </div>
    );
  }

  if (status !== 'authenticated' || user === null) {
    return <Navigate to={redirectTo} replace />;
  }

  if (anyOf !== undefined && anyOf.length > 0 && !user.hasAnyRole(anyOf)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
};
