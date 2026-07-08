import { Suspense, lazy, type ReactElement } from 'react';
import { Route, Routes } from 'react-router-dom';
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
const ForbiddenPage = lazy(async () => ({
  default: (await import('@app/pages/ForbiddenPage')).ForbiddenPage,
}));
const NotFoundPage = lazy(async () => ({
  default: (await import('@app/pages/NotFoundPage')).NotFoundPage,
}));

/**
 * Central route table. Public routes sit outside the guard; authenticated routes nest under
 * <ProtectedRoute> and the <AppLayout> shell. Routed pages lazy-load behind one <Suspense>.
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
            <Route path="/tutorials" element={<TutorialsPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/certificates" element={<CertificatesPage />} />
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
