import { createAssignments, type MockAssignment } from './seed/assignment-seed';
import { createCategories, type MockCategory } from './seed/categories';
import { COURSE_SEEDS, type CourseSeed } from './seed/course-seed';
import { createDirectory, type DirectoryUser } from './seed/directory-seed';
import { createEnrollments, type MockEnrollment } from './seed/enrollment-seed';
import { MOCK_USERS } from './seed/mock-users';
import { createNotifications, type MockNotification } from './seed/notification-seed';
import {
  createTeams,
  createUserTypes,
  type MockTeam,
  type MockUserType,
} from './seed/org-seed';
import { createPermissionSets, createTypeDefaults } from './seed/permission-sets';
import { createQuizzes, type QuizSeed } from './seed/quiz-seed';
import { RESOURCE_SEEDS, type ResourceSeed } from './seed/resource-seed';
import { createReviews, type MockReview } from './seed/review-seed';
import { createSubmissions, type MockContentItem } from './seed/submission-seed';
import { createEmailTemplates, type MockEmailTemplate } from './seed/template-seed';
import { TUTORIAL_SEEDS, type TutorialSeed } from './seed/tutorial-seed';

export interface MockCompletion {
  /** ISO time the item was completed; `null` while only some videos are done. */
  readonly at: string | null;
  /** Tutorial videos the learner has finished. */
  readonly videos: Set<string>;
}

export interface MockQuizAttempt {
  readonly attemptNumber: number;
  readonly version: number;
  readonly correctCount: number;
  readonly totalCount: number;
  readonly score: number;
  readonly passed: boolean;
  readonly answers: Record<string, string[]>;
}

export interface MockRevision {
  readonly id: string;
  readonly contentItemId: string;
  readonly authorId: string;
  readonly authorName: string;
  /** 5 PendingReview · 10 InReview · 15 Approved · 25 Rejected. */
  status: number;
  payloadJson: string;
  reviewerNotes: string | null;
  readonly creationTime: string;
  lastModificationTime: string | null;
}

export interface MockPlatformSettings {
  publicSignup: boolean;
  publicCatalog: boolean;
  approval: boolean;
  selfEnrol: boolean;
  autoCertificates: boolean;
  ratings: boolean;
  reminders: boolean;
  email: boolean;
}

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
  readonly tutorials: TutorialSeed[];
  readonly resources: ResourceSeed[];
  readonly enrollments: MockEnrollment[];
  /** `${userId}:${contentId}` -> completion of a tutorial or resource. */
  readonly completions: Map<string, MockCompletion>;
  readonly notifications: MockNotification[];
  /** `${userId}:${contentId}` for every "this was helpful" vote. */
  readonly helpfulVotes: Set<string>;
  /** userId -> saved dashboard widget layout (absent = the user-type default). */
  readonly dashboards: Map<string, unknown>;
  readonly quizzes: QuizSeed[];
  /** `${userId}:${quizId}` -> attempts. */
  readonly quizAttempts: Map<string, MockQuizAttempt[]>;
  readonly reviews: MockReview[];
  readonly directory: DirectoryUser[];
  readonly userTypes: MockUserType[];
  readonly teams: MockTeam[];
  readonly submissions: MockContentItem[];
  readonly revisions: MockRevision[];
  readonly assignments: MockAssignment[];
  readonly emailTemplates: MockEmailTemplate[];
  /** kind number (0/5/10) -> custom certificate HTML. */
  readonly certificateTemplates: Map<
    number,
    { content: string; lastModificationTime: string }
  >;
  readonly platformSettings: MockPlatformSettings;
  /** Monotonic counter for ids minted by create endpoints. */
  readonly sequence: { next: number };
}

const pendingRevision = (now: Date): MockRevision => ({
  id: 'rev-pending-1',
  contentItemId: 'course-communication',
  authorId: 'user-manager',
  authorName: 'Daniel Okafor',
  status: 5,
  payloadJson: JSON.stringify({
    details: {
      title: 'Consultative Communication (2026 edition)',
      description: 'Refreshed examples and a new section on difficult conversations.',
    },
    tags: ['communication', 'sales'],
  }),
  reviewerNotes: null,
  creationTime: new Date(now.getTime() - 2 * 86_400_000).toISOString(),
  lastModificationTime: null,
});

const seedCompletions = (now: Date): Map<string, MockCompletion> => {
  const ago = (days: number): string =>
    new Date(now.getTime() - days * 86_400_000).toISOString();
  return new Map<string, MockCompletion>([
    [
      'user-consultant:tut-platform-tour',
      { at: ago(20), videos: new Set(['asset-vid-1', 'asset-vid-3', 'asset-vid-6']) },
    ],
    ['user-consultant:tut-crm-basics', { at: null, videos: new Set(['asset-vid-2']) }],
    ['user-consultant:res-handbook', { at: ago(18), videos: new Set() }],
    [
      'user-manager:tut-platform-tour',
      { at: ago(35), videos: new Set(['asset-vid-1', 'asset-vid-3', 'asset-vid-6']) },
    ],
    ['user-manager:res-handbook', { at: ago(33), videos: new Set() }],
  ]);
};

export const createMockState = (now: Date = new Date()): MockState => {
  const courses = [...COURSE_SEEDS];
  const contentIds = [
    ...courses.map((c) => c.id),
    ...TUTORIAL_SEEDS.map((t) => t.id),
    ...RESOURCE_SEEDS.map((r) => r.id),
  ];
  return {
    now,
    permissionSets: createPermissionSets(),
    typeDefaults: createTypeDefaults(),
    categories: createCategories(),
    courses,
    tutorials: [...TUTORIAL_SEEDS],
    resources: [...RESOURCE_SEEDS],
    enrollments: createEnrollments(now),
    completions: seedCompletions(now),
    notifications: createNotifications(
      now,
      MOCK_USERS.map((user) => user.id),
    ),
    helpfulVotes: new Set<string>(),
    dashboards: new Map<string, unknown>(),
    quizzes: createQuizzes(),
    quizAttempts: new Map(),
    reviews: createReviews(now, contentIds),
    directory: createDirectory(),
    userTypes: createUserTypes(),
    teams: createTeams(),
    submissions: createSubmissions(now),
    revisions: [pendingRevision(now)],
    assignments: createAssignments(now),
    emailTemplates: createEmailTemplates(now.toISOString()),
    certificateTemplates: new Map(),
    platformSettings: {
      publicSignup: false,
      publicCatalog: true,
      approval: true,
      selfEnrol: true,
      autoCertificates: true,
      ratings: true,
      reminders: true,
      email: true,
    },
    sequence: { next: 1000 },
  };
};

/** Mints a unique id for entities created through the mock API. */
export const nextId = (state: MockState, prefix: string): string => {
  const next = state.sequence.next + 1;
  Object.assign(state.sequence, { next });
  return `${prefix}-${String(next)}`;
};
