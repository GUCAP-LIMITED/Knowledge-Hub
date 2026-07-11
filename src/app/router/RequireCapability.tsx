import type { ReactElement } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useMyCapabilities, type CapId } from '@features/users';

export interface RequireCapabilityProps {
  readonly module: string;
  readonly cap: CapId;
  readonly redirectTo?: string;
}

/**
 * Capability route guard, layered inside the role-based `ProtectedRoute`. The role gate is the
 * outer backstop; this refines it so a revoked capability closes the route to match the nav.
 */
export const RequireCapability = ({
  module,
  cap,
  redirectTo = '/forbidden',
}: RequireCapabilityProps): ReactElement => {
  const { can } = useMyCapabilities();
  return can(module, cap) ? <Outlet /> : <Navigate to={redirectTo} replace />;
};
