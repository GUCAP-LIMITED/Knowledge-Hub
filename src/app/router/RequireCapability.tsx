import type { ReactElement } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Spinner } from '@shared/ui';
import { useMyCapabilities, type CapId } from '@features/users';

export interface RequireCapabilityProps {
  readonly module: string;
  readonly cap: CapId;
  readonly redirectTo?: string;
}

/**
 * Capability route guard, layered inside the role-based `ProtectedRoute`. The role gate is the
 * outer backstop; this refines it so a revoked capability closes the route to match the nav.
 *
 * While the effective-permission map is still loading (e.g. a hard refresh), it shows a spinner
 * rather than deciding — otherwise `can()` would be false mid-load and bounce the user to /forbidden.
 */
export const RequireCapability = ({
  module,
  cap,
  redirectTo = '/forbidden',
}: RequireCapabilityProps): ReactElement => {
  const { can, isLoading } = useMyCapabilities();

  if (isLoading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <Spinner size="lg" label="Checking access" />
      </div>
    );
  }

  return can(module, cap) ? <Outlet /> : <Navigate to={redirectTo} replace />;
};
