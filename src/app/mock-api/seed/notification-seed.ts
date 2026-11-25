export interface MockNotification {
  readonly id: string;
  readonly userId: string;
  readonly title: string;
  readonly message: string;
  /** Backend priority enum: 0 Low · 5 Normal · 10 Medium · 15 High. */
  readonly priority: 0 | 5 | 10 | 15;
  readonly priorityName: 'High' | 'Medium' | 'Low' | 'Normal';
  readonly topicId: string | null;
  isRead: boolean;
  readTime: string | null;
  readonly creationTime: string;
}

const ago = (now: Date, hours: number): string =>
  new Date(now.getTime() - hours * 3_600_000).toISOString();

const PRIORITY_VALUES = { Low: 0, Normal: 5, Medium: 10, High: 15 } as const;

const TEMPLATES = [
  [
    'New course available',
    'Consultative Communication is now live in the catalogue.',
    'Medium',
    'courses',
    2,
  ],
  [
    'Training due soon',
    'Admissions Fundamentals is due in 6 days.',
    'High',
    'assignments',
    5,
  ],
  [
    'Compliance reminder',
    'Data Protection & Compliance is overdue. Please complete it today.',
    'High',
    'assignments',
    26,
  ],
  [
    'Certificate issued',
    'Your Welcome to UAPP certificate is ready to download.',
    'Normal',
    'certificates',
    50,
  ],
  [
    'Platform update',
    'Dark mode and a refreshed dashboard are now available.',
    'Low',
    'platform',
    120,
  ],
  [
    'Review requested',
    'Tell us what you thought of Welcome to UAPP.',
    'Low',
    'reviews',
    200,
  ],
] as const;

export const createNotifications = (
  now: Date,
  userIds: readonly string[],
): MockNotification[] =>
  userIds.flatMap((userId) =>
    TEMPLATES.map(([title, message, priorityName, topicId, hours], index) => ({
      id: `notif-${userId}-${String(index + 1)}`,
      userId,
      title,
      message,
      priority: PRIORITY_VALUES[priorityName],
      priorityName,
      topicId,
      isRead: index >= 3,
      readTime: index >= 3 ? ago(now, hours - 1) : null,
      creationTime: ago(now, hours),
    })),
  );
