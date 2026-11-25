import type { ReactElement } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Spinner } from '@shared/ui';
import { useAuth } from './use-auth';

export interface ProtectedRouteProps {
  readonly redirectTo?: string;
}

/**
 * Route guard. Renders the matched child route only for an authenticated user; otherwise
 * redirects to sign-in. Authorization (which permission a route needs) is a separate concern —
 * see <RequirePermission>. Keeping this in one place means no page re-implements the
 * "am I signed in?" check.
 */
export const ProtectedRoute = ({
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

  return <Outlet />;
};
