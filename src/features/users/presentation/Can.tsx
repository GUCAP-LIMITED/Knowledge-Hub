import type { ReactElement, ReactNode } from 'react';
import type { CapId } from './permission-catalog';
import { useMyCapabilities } from './use-my-capabilities';

export interface CanProps {
  /** The permission module id, e.g. `courses`, `approvals`, `settings`. */
  readonly module: string;
  readonly cap: CapId;
  readonly children: ReactNode;
  /** Rendered instead when the capability is absent (defaults to nothing). */
  readonly fallback?: ReactNode;
}

/** Renders `children` only when the signed-in user holds the given capability. */
export const Can = ({
  module,
  cap,
  children,
  fallback = null,
}: CanProps): ReactElement => {
  const { can } = useMyCapabilities();
  return <>{can(module, cap) ? children : fallback}</>;
};
