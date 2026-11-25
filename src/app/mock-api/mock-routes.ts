import type { Clock } from '@core/time';
import { authHandlers } from './handlers/auth-handlers';
import { permissionHandlers } from './handlers/permission-handlers';
import type { MockState } from './mock-state';
import type { MockRoute } from './mock-types';

export interface MockRouteDeps {
  readonly state: MockState;
  readonly clock: Clock;
}

/** Every mock endpoint. Add new feature handlers here as the demo backend grows. */
export const buildMockRoutes = ({
  state,
  clock,
}: MockRouteDeps): readonly MockRoute[] => [
  ...authHandlers(clock),
  ...permissionHandlers(state),
];
