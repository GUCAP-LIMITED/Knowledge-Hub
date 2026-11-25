import { lazy, Suspense, type ReactElement } from 'react';
import { Navigate, Route, Routes, useParams, useSearchParams } from 'react-router-dom';
import { LoginPage, ProtectedRoute } from '@features/auth';
import { AppLayout } from '@app/layout/AppLayout';
import { RequirePermission } from '@app/router/RequirePermission';
import { Spinner } from '@shared/ui';
import { MockLauncherWidgetPage, MockPortalLoginPage } from '@app/mock-portal';

// Pages are code-split. Each is imported from its module path (not the feature barrel) so it lands
// in its own chunk; the barrel is eagerly imported for the module provider.
const ConfigurableDashboardPage = lazy(async () => ({
  default: (await import('@app/pages/ConfigurableDashboardPage'))
    .ConfigurableDashboardPage,
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
const TutorialDetailPage = lazy(async () => ({
  default: (await import('@app/pages/TutorialDetailPage')).TutorialDetailPage,
}));
const ResourcesPage = lazy(async () => ({
  default: (await import('@features/resources/presentation/ResourcesPage')).ResourcesPage,
}));
const ResourceDetailPage = lazy(async () => ({
  default: (await import('@app/pages/ResourceDetailPage')).ResourceDetailPage,
}));

const CertificatesPage = lazy(async () => ({
  default: (await import('@features/certificates/presentation/CertificatesPage'))
    .CertificatesPage,
}));
const CertificateVerifyPage = lazy(async () => ({
  default: (await import('@features/certificates/presentation/CertificateVerifyPage'))
    .CertificateVerifyPage,
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

const RevisionReviewStudio = lazy(async () => ({
  default: (await import('@features/submissions/presentation/RevisionReviewStudio'))
    .RevisionReviewStudio,
}));
const EditSubmissionPage = lazy(async () => ({
  default: (await import('@features/submissions/presentation/EditSubmissionPage'))
    .EditSubmissionPage,
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

const LegacyContentEditRedirect = (): ReactElement => {
  const { id } = useParams<{ readonly id: string }>();
  const [searchParams] = useSearchParams();
  const search = searchParams.toString();
  const target = id
    ? `/submissions/${id}/edit${search ? `?${search}` : ''}`
    : '/submissions';
  return <Navigate to={target} replace />;
};

const LegacyReviewStudioRedirect = (): ReactElement => {
  const { id } = useParams<{ readonly id: string }>();
  const [searchParams] = useSearchParams();
  const revisionId = searchParams.get('revisionId');
  const target = id
    ? revisionId
      ? `/approvals/review/${id}/${revisionId}`
      : `/approvals/review/${id}`
    : '/approvals';
  return <Navigate to={target} replace />;
};

// Grouped as module-level fragments (not helper components — <Routes> only resolves literal
// <Route>/<Fragment> elements in its child tree, so extraction has to happen outside the JSX,
// not via a wrapping component) purely to keep AppRouter itself under the function-length limit.
const learningRoutes = (
  <>
    <Route element={<RequirePermission path="/" />}>
      <Route path="/" element={<ConfigurableDashboardPage />} />
      <Route path="/dashboard" element={<ConfigurableDashboardPage />} />
    </Route>
    <Route element={<RequirePermission path="/courses" />}>
      <Route path="/courses" element={<CoursesPage />} />
    </Route>
    <Route element={<RequirePermission path="/tutorials" />}>
      <Route path="/tutorials" element={<TutorialsPage />} />
    </Route>
    <Route element={<RequirePermission path="/resources" />}>
      <Route path="/resources" element={<ResourcesPage />} />
    </Route>

    {/* Detail routes are reachable from My Learning even when a catalog permission was revoked;
        the backend still enforces completion/enrollment entitlement item by item. */}
    <Route element={<RequirePermission anyOf={['Courses.View', 'MyLearning.View']} />}>
      <Route path="/courses/:id" element={<CourseDetailPage />} />
    </Route>
    <Route element={<RequirePermission anyOf={['Tutorials.View', 'MyLearning.View']} />}>
      <Route path="/tutorials/:id" element={<TutorialDetailPage />} />
    </Route>
    <Route element={<RequirePermission anyOf={['Resources.View', 'MyLearning.View']} />}>
      <Route path="/resources/:id" element={<ResourceDetailPage />} />
    </Route>
    <Route element={<RequirePermission path="/certificates" />}>
      <Route path="/certificates" element={<CertificatesPage />} />
    </Route>
    <Route element={<RequirePermission path="/reviews" />}>
      <Route path="/reviews" element={<ReviewsPage />} />
    </Route>
    <Route element={<RequirePermission path="/my-learning" />}>
      <Route path="/my-learning" element={<MyLearningPage />} />
    </Route>
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/user-settings" element={<UserSettingsPage />} />
    {/* Unlisted maintainer route — the living style guide. */}
    <Route path="/styleguide" element={<StyleguidePage />} />
  </>
);

// Content workspace — permission-gated (managers and admins hold Submissions.View) — plus admin
// areas, each permission-gated individually to match the nav.
const workspaceRoutes = (
  <>
    <Route element={<RequirePermission path="/upload" />}>
      <Route path="/upload" element={<UploadPage />} />
    </Route>
    <Route element={<RequirePermission path="/submissions" />}>
      <Route path="/submissions" element={<SubmissionsPage />} />
      <Route path="/submissions/:id/edit" element={<EditSubmissionPage />} />
      <Route path="/content/:id/edit" element={<LegacyContentEditRedirect />} />
    </Route>
    <Route element={<RequirePermission path="/team-progress" />}>
      <Route path="/team-progress" element={<TeamProgressPage />} />
    </Route>
    <Route element={<RequirePermission path="/assign" />}>
      <Route path="/assign" element={<AssignTrainingPage />} />
    </Route>
    <Route element={<RequirePermission path="/teams" />}>
      <Route path="/teams" element={<TeamsPage />} />
    </Route>
    <Route element={<RequirePermission path="/approvals" />}>
      <Route path="/approvals" element={<ApprovalsPage />} />
      <Route
        path="/approvals/review/:id/:revisionId?"
        element={<RevisionReviewStudio />}
      />
      <Route path="/content/review-studio/:id" element={<LegacyReviewStudioRedirect />} />
    </Route>
    <Route element={<RequirePermission path="/course-reviews" />}>
      <Route path="/course-reviews" element={<CourseReviewsPage />} />
    </Route>
    <Route element={<RequirePermission path="/settings/users/user-types" />}>
      <Route path="/settings/users/user-types" element={<UserTypesPage />} />
    </Route>
    <Route
      path="/dashboard/configure"
      element={<Navigate to="/settings/dashboards" replace />}
    />
    <Route path="/users" element={<Navigate to="/settings/users" replace />} />
    <Route element={<RequirePermission path="/settings/:section" />}>
      <Route path="/settings" element={<Navigate to="/settings/platform" replace />} />
      <Route path="/settings/:section" element={<AdminSettingsPage />} />
    </Route>
    {/* 403 / 404 render inside the shell so the user keeps their navigation. */}
    <Route path="/forbidden" element={<ForbiddenPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </>
);

/**
 * Central route table. Public routes sit outside the guard; authenticated routes nest under
 * <ProtectedRoute> and the <AppLayout> shell. Every restricted area is gated purely by
 * <RequirePermission>, driven by the live `GET /api/app/my/permissions` response — there is no
 * client-side role check anywhere in this table. Routed pages lazy-load behind one <Suspense>.
 */
export const AppRouter = (): ReactElement => {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* Demo-only stand-in for the Uapp Portal SSO (this build has no backend). */}
        <Route path="/mock-portal" element={<MockPortalLoginPage />} />
        <Route
          path="/mock-portal/embed/widgets/app-launcher"
          element={<MockLauncherWidgetPage />}
        />
        {/* Public: the certificate QR code / shared link opens this without signing in. */}
        <Route
          path="/certificates/verify/:certificateId"
          element={<CertificateVerifyPage />}
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {learningRoutes}
            {workspaceRoutes}
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
