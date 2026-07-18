import { Suspense, lazy, type ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage, ProtectedRoute } from '@features/auth';
import { AppLayout } from '@app/layout/AppLayout';
import { RequireCapability } from '@app/router/RequireCapability';
import { Spinner } from '@shared/ui';

// Pages are code-split. Each is imported from its module path (not the feature barrel) so it lands
// in its own chunk; the barrel is eagerly imported for the module provider.
const DashboardPage = lazy(async () => ({
  default: (await import('@app/pages/DashboardPage')).DashboardPage,
}));
const CoursesPage = lazy(async () => ({
  default: (await import('@features/courses/presentation/CoursesPage')).CoursesPage,
}));
const CourseDetailPage = lazy(async () => ({
  default: (await import('@app/pages/CourseDetailPage')).CourseDetailPage,
}));
const TutorialsPage = lazy(async () => ({
  default: (await import('@features/tutorials/presentation/TutorialsPage')).TutorialsPage,
}));
const ResourcesPage = lazy(async () => ({
  default: (await import('@features/resources/presentation/ResourcesPage')).ResourcesPage,
}));
const CertificatesPage = lazy(async () => ({
  default: (await import('@features/certificates/presentation/CertificatesPage'))
    .CertificatesPage,
}));
const ReviewsPage = lazy(async () => ({
  default: (await import('@features/course-reviews/presentation/ReviewsPage'))
    .ReviewsPage,
}));
const CourseReviewsPage = lazy(async () => ({
  default: (await import('@features/course-reviews/presentation/CourseReviewsPage'))
    .CourseReviewsPage,
}));
const SubmissionsPage = lazy(async () => ({
  default: (await import('@features/submissions/presentation/SubmissionsPage'))
    .SubmissionsPage,
}));
const ApprovalsPage = lazy(async () => ({
  default: (await import('@features/submissions/presentation/ApprovalsPage'))
    .ApprovalsPage,
}));
const MyLearningPage = lazy(async () => ({
  default: (await import('@app/pages/MyLearningPage')).MyLearningPage,
}));
const ProfilePage = lazy(async () => ({
  default: (await import('@app/pages/ProfilePage')).ProfilePage,
}));
const UserSettingsPage = lazy(async () => ({
  default: (await import('@app/pages/UserSettingsPage')).UserSettingsPage,
}));
const TeamProgressPage = lazy(async () => ({
  default: (await import('@features/team/presentation/TeamProgressPage'))
    .TeamProgressPage,
}));
const AssignTrainingPage = lazy(async () => ({
  default: (await import('@features/assignments/presentation/AssignTrainingPage'))
    .AssignTrainingPage,
}));
const AdminSettingsPage = lazy(async () => ({
  default: (await import('@features/users/presentation/AdminSettingsPage'))
    .AdminSettingsPage,
}));
const UserTypesPage = lazy(async () => ({
  default: (await import('@features/user-types/presentation/UserTypesPage'))
    .UserTypesPage,
}));
const TeamsPage = lazy(async () => ({
  default: (await import('@features/teams/presentation/TeamsPage')).TeamsPage,
}));
const HierarchyPage = lazy(async () => ({
  default: (await import('@features/hierarchy/presentation/HierarchyPage')).HierarchyPage,
}));
const PermissionsPage = lazy(async () => ({
  default: (await import('@features/permissions/presentation/PermissionsPage'))
    .PermissionsPage,
}));
const ConfigurableDashboardPage = lazy(async () => ({
  default: (await import('@features/dashboard/presentation/DashboardPage')).DashboardPage,
}));
const UploadPage = lazy(async () => ({
  default: (await import('@features/submissions/presentation/UploadPage')).UploadPage,
}));
const StyleguidePage = lazy(async () => ({
  default: (await import('@app/pages/StyleguidePage')).StyleguidePage,
}));
const ForbiddenPage = lazy(async () => ({
  default: (await import('@app/pages/ForbiddenPage')).ForbiddenPage,
}));
const NotFoundPage = lazy(async () => ({
  default: (await import('@app/pages/NotFoundPage')).NotFoundPage,
}));

/**
 * Central route table. Public routes sit outside the guard; authenticated routes nest under
 * <ProtectedRoute> and the <AppLayout> shell. Role-restricted areas add an inner <ProtectedRoute
 * anyOf=...> guard. Routed pages lazy-load behind one <Suspense>.
 */
export const AppRouter = (): ReactElement => {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/tutorials" element={<TutorialsPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/my-learning" element={<MyLearningPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/user-settings" element={<UserSettingsPage />} />
            {/* Unlisted maintainer route — the living style guide. */}
            <Route path="/styleguide" element={<StyleguidePage />} />

            {/* Content workspace — managers and admins, refined by capability. */}
            <Route element={<ProtectedRoute anyOf={['admin', 'manager']} />}>
              <Route element={<RequireCapability module="submissions" cap="create" />}>
                <Route path="/upload" element={<UploadPage />} />
              </Route>
              <Route element={<RequireCapability module="submissions" cap="view" />}>
                <Route path="/submissions" element={<SubmissionsPage />} />
              </Route>
            </Route>

            {/* Admin areas — role backstop, then capability-gated to match the nav. */}
            <Route element={<ProtectedRoute anyOf={['admin']} />}>
              <Route element={<RequireCapability module="team" cap="view" />}>
                <Route path="/team-progress" element={<TeamProgressPage />} />
              </Route>
              <Route element={<RequireCapability module="team" cap="assign" />}>
                <Route path="/assign" element={<AssignTrainingPage />} />
              </Route>
              <Route element={<RequireCapability module="team" cap="manage" />}>
                <Route path="/teams" element={<TeamsPage />} />
              </Route>
              <Route element={<RequireCapability module="approvals" cap="view" />}>
                <Route path="/approvals" element={<ApprovalsPage />} />
              </Route>
              <Route element={<RequireCapability module="reviews" cap="moderate" />}>
                <Route path="/course-reviews" element={<CourseReviewsPage />} />
              </Route>
              <Route path="/user-types" element={<UserTypesPage />} />
              <Route path="/hierarchy" element={<HierarchyPage />} />
              <Route path="/permissions" element={<PermissionsPage />} />
              <Route path="/dashboard" element={<ConfigurableDashboardPage />} />
              <Route element={<RequireCapability module="settings" cap="manage" />}>
                <Route
                  path="/settings"
                  element={<Navigate to="/settings/platform" replace />}
                />
                <Route path="/settings/:section" element={<AdminSettingsPage />} />
              </Route>
            </Route>

            {/* 403 / 404 render inside the shell so the user keeps their navigation. */}
            <Route path="/forbidden" element={<ForbiddenPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

const RouteFallback = (): ReactElement => (
  <div className="route-fallback">
    <Spinner size="lg" label="Loading page" />
  </div>
);
