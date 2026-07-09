import {
  AlertCircle,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle,
  Clock,
  Eye,
  FileCheck,
  FolderOpen,
  HelpCircle,
  LayoutGrid,
  Play,
  PlayCircle,
  Star,
  Upload,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { StatTone } from '@shared/ui';

export type Role = 'admin' | 'manager' | 'consultant';
export type QuickTone = 'primary' | 'secondary' | 'info' | 'warning';

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
  readonly tone: QuickTone;
  readonly to: string;
}

export interface Stat {
  readonly label: string;
  readonly value: string | number;
  readonly icon: LucideIcon;
  readonly tone: StatTone;
  readonly hint?: string;
}

const adminActions = (ctx: DashCtx): readonly QuickAction[] => [
  {
    label: 'Review Queue',
    desc: `${String(ctx.pending)} items waiting`,
    icon: CheckCircle,
    tone: 'warning',
    to: '/approvals',
  },
  {
    label: 'Manage Content',
    desc: 'Edit and publish',
    icon: LayoutGrid,
    tone: 'info',
    to: '/content',
  },
  {
    label: 'Team Progress',
    desc: 'View team analytics',
    icon: BarChart3,
    tone: 'primary',
    to: '/team-progress',
  },
  {
    label: 'Course Reviews',
    desc: 'See all feedback',
    icon: Star,
    tone: 'secondary',
    to: '/course-reviews',
  },
];

const managerActions = (ctx: DashCtx, learnTo: string): readonly QuickAction[] => [
  {
    label: 'Continue Learning',
    desc: ctx.continueTitle ?? 'Browse catalog',
    icon: Play,
    tone: 'primary',
    to: learnTo,
  },
  {
    label: 'Upload Document',
    desc: 'Submit for review',
    icon: Upload,
    tone: 'secondary',
    to: '/upload',
  },
  {
    label: 'My Submissions',
    desc: 'Track status',
    icon: FileCheck,
    tone: 'info',
    to: '/submissions',
  },
  {
    label: 'Knowledge Base',
    desc: 'Browse resources',
    icon: FolderOpen,
    tone: 'primary',
    to: '/resources',
  },
];

const learnerActions = (ctx: DashCtx, learnTo: string): readonly QuickAction[] => [
  {
    label: 'Resume Learning',
    desc: ctx.continueTitle ?? 'Browse catalog',
    icon: Play,
    tone: 'primary',
    to: learnTo,
  },
  {
    label: 'Browse Courses',
    desc: `${String(ctx.coursesCount)} available`,
    icon: PlayCircle,
    tone: 'secondary',
    to: '/courses',
  },
  {
    label: 'My Certificates',
    desc: `${String(ctx.certCount)} earned`,
    icon: Award,
    tone: 'warning',
    to: '/certificates',
  },
  {
    label: 'Resources',
    desc: 'Help & guides',
    icon: HelpCircle,
    tone: 'info',
    to: '/resources',
  },
];

export const buildActions = (role: Role, ctx: DashCtx): readonly QuickAction[] => {
  const learnTo = ctx.continueTitle !== null ? '/my-learning' : '/courses';
  if (role === 'admin') {
    return adminActions(ctx);
  }
  if (role === 'manager') {
    return managerActions(ctx, learnTo);
  }
  return learnerActions(ctx, learnTo);
};

export const buildStats = (role: Role, ctx: DashCtx): readonly Stat[] => {
  if (role === 'admin') {
    return [
      { label: 'Total Users', value: ctx.usersCount, icon: Users, tone: 'primary' },
      {
        label: 'Active Courses',
        value: ctx.coursesCount,
        icon: BookOpen,
        tone: 'success',
      },
      { label: 'Pending Reviews', value: ctx.pending, icon: FileCheck, tone: 'warning' },
      { label: 'Views (7d)', value: '1,240', icon: Eye, tone: 'info' },
    ];
  }
  if (role === 'manager') {
    return [
      {
        label: 'My Progress',
        value: ctx.inProgressCount,
        icon: BookOpen,
        tone: 'primary',
        hint: `${String(ctx.completedCount)} completed`,
      },
      {
        label: 'Submissions',
        value: ctx.submissionsCount,
        icon: Upload,
        tone: 'info',
        hint: `${String(ctx.pending)} pending`,
      },
      {
        label: 'Published',
        value: ctx.publishedCount,
        icon: CheckCircle,
        tone: 'success',
      },
      {
        label: 'Need Action',
        value: ctx.rejectedCount,
        icon: AlertCircle,
        tone: 'danger',
      },
    ];
  }
  return [
    { label: 'In Progress', value: ctx.inProgressCount, icon: BookOpen, tone: 'primary' },
    { label: 'Completed', value: ctx.completedCount, icon: CheckCircle, tone: 'success' },
    { label: 'Certificates', value: ctx.certCount, icon: Award, tone: 'secondary' },
    { label: 'Hours Logged', value: '47h', icon: Clock, tone: 'info' },
  ];
};
