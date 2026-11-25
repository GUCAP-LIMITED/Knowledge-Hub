import { useAuth, type AuthenticatedUser } from '@features/auth';
import { useCourses, type Course } from '@features/courses';
import { useCertificates } from '@features/certificates';
import { useSubmissions } from '@features/submissions';
import { useBranchUsers, useMyCapabilities } from '@features/users';
import {
  useAnnouncements,
  useMarkAllRead,
  type Announcement,
} from '@features/notifications';
import { formatDisplayName } from '@shared/utils';
import { resolveUserTier, subtitleFor, type DashCtx, type Role } from './dashboard-data';

export interface DashboardContextValue {
  readonly user: AuthenticatedUser | null;
  readonly role: Role;
  readonly name: string;
  readonly firstName: string;
  readonly ctx: DashCtx;
  readonly subtitle: string;
  readonly inProgress: readonly Course[];
  readonly announcements: readonly Announcement[];
  readonly markAll: ReturnType<typeof useMarkAllRead>;
}

export function useDashboardContext(): DashboardContextValue {
  const { user } = useAuth();
  const { can } = useMyCapabilities();
  const role = resolveUserTier(can);
  const courses = useCourses();
  const certificates = useCertificates();
  const submissions = useSubmissions();
  const users = useBranchUsers(null, can('dashboard', 'manage'));
  const announcements = useAnnouncements();
  const markAll = useMarkAllRead();

  const list = courses.data ?? [];
  const inProgress = list.filter(
    (course) => course.hasStarted() && !course.isCompleted(),
  );
  const subs = submissions.data ?? [];
  const ann = announcements.data ?? [];

  const ctx: DashCtx = {
    pending: subs.filter((s) => s.awaitsDecision()).length,
    coursesCount: list.length,
    completedCount: list.filter((c) => c.isCompleted()).length,
    inProgressCount: inProgress.length,
    certCount: certificates.data?.totalCount ?? 0,
    submissionsCount: subs.length,
    publishedCount: subs.filter((s) => s.status === 'published').length,
    rejectedCount: subs.filter((s) => s.status === 'rejected').length,
    usersCount: (users.data ?? []).length,
    continueTitle: inProgress[0]?.title ?? null,
  };
  const name = user?.fullName ? formatDisplayName(user.fullName) : 'there';
  const firstName = name;
  const subtitle = subtitleFor(role, ctx);

  return {
    user,
    role,
    name,
    firstName,
    ctx,
    subtitle,
    inProgress,
    announcements: ann,
    markAll,
  };
}
