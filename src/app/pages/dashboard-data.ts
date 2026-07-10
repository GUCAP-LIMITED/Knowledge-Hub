import {
  Award,
  BarChart3,
  BookOpen,
  CalendarCheck,
  CheckCircle,
  FileCheck,
  FolderOpen,
  GraduationCap,
  Play,
  PlayCircle,
  Upload,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { KpiDelta } from '@shared/ui';

export type Role = 'admin' | 'manager' | 'consultant';

export interface DashCtx {
  readonly pending: number;
  readonly coursesCount: number;
  readonly completedCount: number;
  readonly inProgressCount: number;
  readonly certCount: number;
  readonly submissionsCount: number;
  readonly publishedCount: number;
  readonly rejectedCount: number;
  readonly usersCount: number;
  readonly continueTitle: string | null;
}

export interface QuickAction {
  readonly label: string;
  readonly desc: string;
  readonly icon: LucideIcon;
  readonly to: string;
  readonly count?: number;
}

export interface Kpi {
  readonly label: string;
  readonly value: string | number;
  readonly icon: LucideIcon;
  readonly to: string;
  readonly spark: readonly number[];
  readonly delta?: KpiDelta;
}

export interface GreetingCta {
  readonly label: string;
  readonly to: string;
  /** A low-emphasis CTA (e.g. "all caught up") renders as a secondary button. */
  readonly muted?: boolean;
}

// Placeholder trend shapes until real analytics land; kept deterministic so cards don't flicker.
const SPARK_UP = [30, 33, 32, 37, 41, 44, 46, 52] as const;
const SPARK_DOWN = [58, 54, 51, 47, 44, 38, 33, 27] as const;
const SPARK_STEADY = [40, 42, 41, 43, 42, 44, 43, 45] as const;

const rate = (part: number, whole: number): number =>
  whole === 0 ? 0 : Math.round((part / whole) * 100);

const adminKpis = (ctx: DashCtx): readonly Kpi[] => [
  {
    label: 'Pending reviews',
    value: ctx.pending,
    icon: FileCheck,
    to: '/approvals',
    spark: SPARK_DOWN,
    delta: { text: '12% · 30d', tone: 'good', dir: 'down' },
  },
  {
    label: 'Learners',
    value: ctx.usersCount,
    icon: Users,
    to: '/settings/users',
    spark: SPARK_UP,
    delta: { text: '8% · 30d', tone: 'good', dir: 'up' },
  },
  {
    label: 'Completion rate',
    value: `${String(rate(ctx.completedCount, ctx.coursesCount))}%`,
    icon: BarChart3,
    to: '/team-progress',
    spark: SPARK_UP,
    delta: { text: '4% · 30d', tone: 'good', dir: 'up' },
  },
  {
    label: 'Certificates issued',
    value: ctx.certCount,
    icon: Award,
    to: '/certificates',
    spark: SPARK_UP,
    delta: { text: 'this quarter', tone: 'muted' },
  },
];

const learnerKpis = (ctx: DashCtx): readonly Kpi[] => [
  {
    label: 'In progress',
    value: ctx.inProgressCount,
    icon: BookOpen,
    to: '/my-learning',
    spark: SPARK_STEADY,
  },
  {
    label: 'Completed',
    value: ctx.completedCount,
    icon: CheckCircle,
    to: '/my-learning',
    spark: SPARK_UP,
    delta: { text: 'this month', tone: 'muted' },
  },
  {
    label: 'Certificates',
    value: ctx.certCount,
    icon: Award,
    to: '/certificates',
    spark: SPARK_UP,
  },
  {
    label: 'Courses available',
    value: ctx.coursesCount,
    icon: PlayCircle,
    to: '/courses',
    spark: SPARK_STEADY,
  },
];

const managerKpis = (ctx: DashCtx): readonly Kpi[] => [
  {
    label: 'In progress',
    value: ctx.inProgressCount,
    icon: BookOpen,
    to: '/my-learning',
    spark: SPARK_STEADY,
  },
  {
    label: 'Submissions',
    value: ctx.submissionsCount,
    icon: Upload,
    to: '/submissions',
    spark: SPARK_UP,
    delta: { text: `${String(ctx.pending)} pending`, tone: 'muted' },
  },
  {
    label: 'Published',
    value: ctx.publishedCount,
    icon: CheckCircle,
    to: '/submissions',
    spark: SPARK_UP,
  },
  {
    label: 'Needs action',
    value: ctx.rejectedCount,
    icon: BarChart3,
    to: '/submissions',
    spark: SPARK_DOWN,
    delta:
      ctx.rejectedCount > 0
        ? { text: 'to revise', tone: 'bad' }
        : { text: 'all clear', tone: 'good' },
  },
];

export const buildKpis = (role: Role, ctx: DashCtx): readonly Kpi[] => {
  if (role === 'admin') {
    return adminKpis(ctx);
  }
  return role === 'manager' ? managerKpis(ctx) : learnerKpis(ctx);
};

const learnRoute = (ctx: DashCtx): string =>
  ctx.continueTitle !== null ? '/my-learning' : '/courses';

const adminActions = (ctx: DashCtx): readonly QuickAction[] => [
  {
    label: 'Review queue',
    desc: 'Approve or reject uploads',
    icon: CheckCircle,
    to: '/approvals',
    count: ctx.pending,
  },
  {
    label: 'Assign training',
    desc: 'Set required courses',
    icon: CalendarCheck,
    to: '/assign',
  },
  {
    label: 'Team progress',
    desc: 'Completion & activity',
    icon: BarChart3,
    to: '/team-progress',
  },
];

const managerActions = (ctx: DashCtx): readonly QuickAction[] => [
  {
    label: 'Resume learning',
    desc: ctx.continueTitle ?? 'Browse the catalog',
    icon: Play,
    to: learnRoute(ctx),
  },
  {
    label: 'Upload document',
    desc: 'Submit for review',
    icon: Upload,
    to: '/upload',
  },
  {
    label: 'My submissions',
    desc: 'Track status',
    icon: FileCheck,
    to: '/submissions',
    count: ctx.pending,
  },
];

const learnerActions = (ctx: DashCtx): readonly QuickAction[] => [
  {
    label: ctx.continueTitle !== null ? 'Resume learning' : 'Browse courses',
    desc: ctx.continueTitle ?? `${String(ctx.coursesCount)} available`,
    icon: Play,
    to: learnRoute(ctx),
  },
  {
    label: 'My certificates',
    desc: `${String(ctx.certCount)} earned`,
    icon: GraduationCap,
    to: '/certificates',
  },
  {
    label: 'Resources',
    desc: 'Guides & policies',
    icon: FolderOpen,
    to: '/resources',
  },
];

export const buildActions = (role: Role, ctx: DashCtx): readonly QuickAction[] => {
  if (role === 'admin') {
    return adminActions(ctx);
  }
  return role === 'manager' ? managerActions(ctx) : learnerActions(ctx);
};

export const buildGreetingCta = (role: Role, ctx: DashCtx): GreetingCta => {
  if (role === 'admin') {
    return ctx.pending > 0
      ? {
          label: `Review ${String(ctx.pending)} submission${ctx.pending === 1 ? '' : 's'}`,
          to: '/approvals',
        }
      : { label: 'Review queue is clear', to: '/approvals', muted: true };
  }
  return ctx.continueTitle !== null
    ? { label: `Resume: ${ctx.continueTitle}`, to: '/my-learning' }
    : { label: 'Browse the catalog', to: '/courses' };
};
