import type { Clock } from '@core/time';
import { authHandlers } from './handlers/auth-handlers';
import { assignmentHandlers } from './handlers/assignment-handlers';
import { categoryHandlers } from './handlers/category-handlers';
import { certificateHandlers } from './handlers/certificate-handlers';
import { contentEditHandlers } from './handlers/content-edit-handlers';
import { contentHandlers } from './handlers/content-handlers';
import { directoryHandlers } from './handlers/directory-handlers';
import { permissionAdminHandlers } from './handlers/permission-admin-handlers';
import { quizHandlers } from './handlers/quiz-handlers';
import { resourceHandlers } from './handlers/resource-handlers';
import { revisionHandlers } from './handlers/revision-handlers';
import { reviewHandlers } from './handlers/review-handlers';
import { teamHandlers } from './handlers/team-handlers';
import { teamProgressHandlers } from './handlers/team-progress-handlers';
import { templateHandlers } from './handlers/template-handlers';
import { tutorialHandlers } from './handlers/tutorial-handlers';
import { userTypeHandlers } from './handlers/user-type-handlers';
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
  ...tutorialHandlers(state),
  ...resourceHandlers(state),
  ...quizHandlers(state),
  ...certificateHandlers(state),
  ...reviewHandlers(state),
  ...directoryHandlers(state),
  ...userTypeHandlers(state),
  ...teamHandlers(state),
  ...teamProgressHandlers(state),
  ...assignmentHandlers(state),
  ...permissionAdminHandlers(state),
  ...templateHandlers(state),
  ...contentHandlers(state),
  ...contentEditHandlers(state),
  ...revisionHandlers(state),
  ...categoryHandlers(state),
];
