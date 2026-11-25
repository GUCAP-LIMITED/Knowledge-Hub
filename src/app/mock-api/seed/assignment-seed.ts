export interface MockAssigneeRef {
  /** 1 user · 2 team · 3 user type. */
  readonly category: 1 | 2 | 3;
  readonly targetId: string;
  readonly displayName: string;
  readonly email?: string;
}

export interface MockAssignment {
  readonly id: string;
  readonly contentItemId: string;
  readonly assignees: MockAssigneeRef[];
  readonly dueDate: string;
  readonly createdAt: string;
  /** Overrides the computed status (used when a manager marks an assignment complete). */
  forcedStatus?: 1 | 2 | 3;
}

const days = (now: Date, d: number): string =>
  new Date(now.getTime() + d * 86_400_000).toISOString();

export const createAssignments = (now: Date): MockAssignment[] => [
  {
    id: 'asg-1',
    contentItemId: 'course-admissions',
    assignees: [
      {
        category: 1,
        targetId: 'user-consultant',
        displayName: 'Priya Nair',
        email: 'consultant@uapp.com',
      },
    ],
    dueDate: days(now, 6),
    createdAt: days(now, -9),
  },
  {
    id: 'asg-2',
    contentItemId: 'course-compliance',
    assignees: [{ category: 2, targetId: 'team-admissions', displayName: 'Admissions' }],
    dueDate: days(now, -2),
    createdAt: days(now, -4),
  },
  {
    id: 'asg-3',
    contentItemId: 'course-welcome',
    assignees: [{ category: 3, targetId: 'ut-consultant', displayName: 'Consultant' }],
    dueDate: days(now, -10),
    createdAt: days(now, -30),
  },
];
