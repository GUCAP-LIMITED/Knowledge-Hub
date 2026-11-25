import { createCategories, type MockCategory } from './seed/categories';
import { COURSE_SEEDS, type CourseSeed } from './seed/course-seed';
import { createEnrollments, type MockEnrollment } from './seed/enrollment-seed';
import { MOCK_USERS } from './seed/mock-users';
import { createNotifications, type MockNotification } from './seed/notification-seed';
import { createPermissionSets, createTypeDefaults } from './seed/permission-sets';

/**
 * The mock backend's mutable world. One instance per app session (created in the composition
 * root), so a page reload resets the demo data — exactly what a stakeholder walkthrough wants.
 */
export interface MockState {
  readonly now: Date;
  readonly permissionSets: ReturnType<typeof createPermissionSets>;
  readonly typeDefaults: ReturnType<typeof createTypeDefaults>;
  readonly categories: MockCategory[];
  readonly courses: CourseSeed[];
  readonly enrollments: MockEnrollment[];
  readonly notifications: MockNotification[];
  /** `${userId}:${contentId}` for every "this was helpful" vote. */
  readonly helpfulVotes: Set<string>;
  /** userId -> saved dashboard widget layout (absent = the user-type default). */
  readonly dashboards: Map<string, unknown>;
}

export const createMockState = (now: Date = new Date()): MockState => ({
  now,
  permissionSets: createPermissionSets(),
  typeDefaults: createTypeDefaults(),
  categories: createCategories(),
  courses: [...COURSE_SEEDS],
  enrollments: createEnrollments(now),
  notifications: createNotifications(
    now,
    MOCK_USERS.map((user) => user.id),
  ),
  helpfulVotes: new Set<string>(),
  dashboards: new Map<string, unknown>(),
});
