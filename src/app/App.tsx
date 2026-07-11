import { useMemo, type ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'motion/react';
import { AuthStoreProvider } from '@features/auth';
import { CoursesModuleProvider } from '@features/courses';
import { TutorialsModuleProvider } from '@features/tutorials';
import { ResourcesModuleProvider } from '@features/resources';
import { CertificatesModuleProvider } from '@features/certificates';
import { SubmissionsModuleProvider } from '@features/submissions';
import { CourseReviewsModuleProvider } from '@features/course-reviews';
import { TeamModuleProvider } from '@features/team';
import { AssignmentsModuleProvider } from '@features/assignments';
import { NotificationsModuleProvider } from '@features/notifications';
import { UsersModuleProvider } from '@features/users';
import { QuizzesModuleProvider } from '@features/quizzes';
import { TooltipProvider, ToastProvider } from '@shared/ui';
import { AppErrorBoundary } from '@app/AppErrorBoundary';
import { ToastErrorBridge } from '@app/ToastErrorBridge';
import { AppRouter } from '@app/router/AppRouter';
import { createComposition } from '@app/di/composition-root';
import { ThemeProvider } from '@app/theme/ThemeProvider';

/**
 * Root component. Builds the dependency graph once, then mounts the provider/router tree. All
 * cross-cutting providers belong here so the rest of the app stays unaware of wiring.
 */
export const App = (): ReactElement => {
  const composition = useMemo(
    () =>
      createComposition({
        env: import.meta.env,
        storage: window.localStorage,
      }),
    [],
  );

  return (
    <AppErrorBoundary logger={composition.logger}>
      <ThemeProvider>
        <QueryClientProvider client={composition.queryClient}>
          <MotionConfig reducedMotion="user">
            <TooltipProvider>
              <ToastProvider>
                <ToastErrorBridge notifier={composition.errorNotifier} />
                <AuthStoreProvider store={composition.authStore}>
                  <CoursesModuleProvider module={composition.coursesModule}>
                    <TutorialsModuleProvider module={composition.tutorialsModule}>
                      <ResourcesModuleProvider module={composition.resourcesModule}>
                        <CertificatesModuleProvider
                          module={composition.certificatesModule}
                        >
                          <SubmissionsModuleProvider
                            module={composition.submissionsModule}
                          >
                            <CourseReviewsModuleProvider
                              module={composition.courseReviewsModule}
                            >
                              <TeamModuleProvider module={composition.teamModule}>
                                <AssignmentsModuleProvider
                                  module={composition.assignmentsModule}
                                >
                                  <NotificationsModuleProvider
                                    module={composition.notificationsModule}
                                  >
                                    <UsersModuleProvider module={composition.usersModule}>
                                      <QuizzesModuleProvider
                                        module={composition.quizzesModule}
                                      >
                                        <BrowserRouter
                                          future={{
                                            v7_startTransition: true,
                                            v7_relativeSplatPath: true,
                                          }}
                                        >
                                          <AppRouter />
                                        </BrowserRouter>
                                      </QuizzesModuleProvider>
                                    </UsersModuleProvider>
                                  </NotificationsModuleProvider>
                                </AssignmentsModuleProvider>
                              </TeamModuleProvider>
                            </CourseReviewsModuleProvider>
                          </SubmissionsModuleProvider>
                        </CertificatesModuleProvider>
                      </ResourcesModuleProvider>
                    </TutorialsModuleProvider>
                  </CoursesModuleProvider>
                </AuthStoreProvider>
              </ToastProvider>
            </TooltipProvider>
          </MotionConfig>
        </QueryClientProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
};
