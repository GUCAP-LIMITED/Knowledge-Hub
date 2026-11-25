export type WidgetKindValue = 0 | 5 | 10 | 15 | 20;

export interface ConfigField {
  readonly key: string;
  readonly label: string;
  /** 0 text · 5 number · 10 boolean · 15 select. */
  readonly type: 0 | 5 | 10 | 15;
  readonly required: boolean;
  readonly defaultValue?: string | number | boolean | null;
  readonly options?: readonly { label: string; value: string | number }[];
}

export interface WidgetDefinition {
  readonly key: string;
  readonly category: string;
  readonly displayName: string;
  /** 0 kpi · 5 series · 10 table · 15 funnel · 20 report. */
  readonly kind: WidgetKindValue;
  readonly defaultWidth: number;
  readonly defaultHeight: number;
  readonly route?: string;
  readonly requiredPermissions: readonly string[];
  readonly configSchema: readonly ConfigField[];
}

const kpi = (
  key: string,
  category: string,
  displayName: string,
  requiredPermissions: readonly string[] = [],
): WidgetDefinition => ({
  key,
  category,
  displayName,
  kind: 0,
  defaultWidth: 3,
  defaultHeight: 1,
  requiredPermissions,
  configSchema: [],
});

const action = (
  key: string,
  displayName: string,
  route: string,
  permission: string,
): WidgetDefinition => ({
  ...kpi(key, 'Quick Actions', displayName, [permission]),
  route,
});

interface WideOptions {
  readonly kind: WidgetKindValue;
  readonly configSchema?: readonly ConfigField[];
  readonly requiredPermissions?: readonly string[];
}

const wide = (
  key: string,
  category: string,
  displayName: string,
  { kind, configSchema = [], requiredPermissions = [] }: WideOptions,
): WidgetDefinition => ({
  key,
  category,
  displayName,
  kind,
  defaultWidth: 6,
  defaultHeight: 3,
  requiredPermissions,
  configSchema,
});

export const WIDGET_CATALOG: readonly WidgetDefinition[] = [
  action('action.browse-courses', 'Browse Courses', '/courses', 'Courses.View'),
  action('action.my-learning', 'My Learning', '/my-learning', 'MyLearning.View'),
  action('action.review-queue', 'Review Queue', '/approvals', 'Approvals.View'),
  action('action.manage-content', 'Manage Content', '/submissions', 'MySubmissions.View'),
  action('action.team-progress', 'Team Progress', '/team-progress', 'TeamProgress.View'),
  action(
    'action.course-reviews',
    'Course Reviews',
    '/course-reviews',
    'CourseReviews.View',
  ),
  kpi('courses.active', 'Courses', 'Active Enrollments'),
  kpi('courses.completed', 'Courses', 'Completed Courses'),
  kpi('learning.overdue', 'Courses', 'Overdue Training'),
  kpi('quizzes.pending', 'Assessments', 'Pending Reviews', ['Approvals.View']),
  wide('courses.overview', 'Courses', 'Course Completion Rate', {
    kind: 5,
    configSchema: [
      {
        key: 'chartType',
        label: 'Chart type',
        type: 15,
        required: false,
        defaultValue: 'bar',
        options: [
          { label: 'Bar', value: 'bar' },
          { label: 'Line', value: 'line' },
        ],
      },
    ],
  }),
  wide('courses.top-rated', 'Courses', 'Top Rated Courses', { kind: 10 }),
  wide('quizzes.scores', 'Assessments', 'Average Quiz Scores', { kind: 5 }),
  wide('learners.progress', 'Learners', 'Top Learners Leaderboard', {
    kind: 10,
    requiredPermissions: ['TeamProgress.View'],
  }),
  wide('certifications.funnel', 'Certifications', 'Certification Pipeline', { kind: 15 }),
  wide('notifications.recent', 'Notifications', 'Recent Notifications', {
    kind: 10,
    configSchema: [
      { key: 'maxCount', label: 'Max items', type: 5, required: false, defaultValue: 5 },
      {
        key: 'filter',
        label: 'Filter',
        type: 15,
        required: false,
        defaultValue: 'all',
        options: [
          { label: 'All', value: 'all' },
          { label: 'Unread', value: 'unread' },
        ],
      },
    ],
  }),
];

export const findWidget = (key: string): WidgetDefinition | undefined =>
  WIDGET_CATALOG.find((widget) => widget.key === key);

/** Default layouts keyed by user type (rows of widget keys, each row laid out on the 12-col grid). */
export const DEFAULT_LAYOUTS: Readonly<Record<string, readonly (readonly string[])[]>> = {
  'ut-admin': [
    [
      'action.review-queue',
      'action.manage-content',
      'action.team-progress',
      'action.course-reviews',
    ],
    ['courses.active', 'courses.completed', 'learning.overdue', 'quizzes.pending'],
    ['courses.overview', 'courses.top-rated'],
    ['certifications.funnel', 'learners.progress'],
    ['notifications.recent'],
  ],
  'ut-branch-manager': [
    [
      'action.review-queue',
      'action.team-progress',
      'action.manage-content',
      'action.browse-courses',
    ],
    ['courses.active', 'courses.completed', 'learning.overdue', 'quizzes.pending'],
    ['courses.overview', 'learners.progress'],
    ['notifications.recent', 'courses.top-rated'],
  ],
  'ut-consultant': [
    ['action.browse-courses', 'action.my-learning', 'action.manage-content'],
    ['courses.active', 'courses.completed', 'learning.overdue'],
    ['courses.top-rated', 'notifications.recent'],
  ],
};
