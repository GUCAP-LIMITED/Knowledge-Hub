import { Suspense, lazy, type ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage, ProtectedRoute } from '@features/auth';
import { AppLayout } from '@app/layout/AppLayout';
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
const UploadPage = lazy(async () => ({
  default: (await import('@features/submissions/presentation/UploadPage')).UploadPage,
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
        <Route path="/forbidden" element={<ForbiddenPage />} />

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

            {/* Content workspace — managers and admins. */}
            <Route element={<ProtectedRoute anyOf={['admin', 'manager']} />}>
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/submissions" element={<SubmissionsPage />} />
            </Route>

            {/* Review queue — admins only. */}
            <Route element={<ProtectedRoute anyOf={['admin']} />}>
              <Route path="/team-progress" element={<TeamProgressPage />} />
              <Route path="/assign" element={<AssignTrainingPage />} />
              <Route path="/approvals" element={<ApprovalsPage />} />
              <Route path="/course-reviews" element={<CourseReviewsPage />} />
              <Route
                path="/settings"
                element={<Navigate to="/settings/platform" replace />}
              />
              <Route path="/settings/:section" element={<AdminSettingsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

const RouteFallback = (): ReactElement => (
  <div className="route-fallback">
    <Spinner size="lg" label="Loading page" />
  </div>
);
