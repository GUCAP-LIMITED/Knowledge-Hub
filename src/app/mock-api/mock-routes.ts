import type { Clock } from '@core/time';
import { authHandlers } from './handlers/auth-handlers';
import { courseHandlers } from './handlers/course-handlers';
import { dashboardHandlers } from './handlers/dashboard-handlers';
import { myLearningHandlers } from './handlers/my-learning-handlers';
import { notificationHandlers } from './handlers/notification-handlers';
import { referenceHandlers } from './handlers/reference-handlers';
import { playbackHandlers, searchHandlers } from './handlers/search-handlers';
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
  ...referenceHandlers(state),
  ...courseHandlers(state, clock),
  ...myLearningHandlers(state),
  ...notificationHandlers(state),
  ...searchHandlers(state),
  ...playbackHandlers(),
  ...dashboardHandlers(state),
];
