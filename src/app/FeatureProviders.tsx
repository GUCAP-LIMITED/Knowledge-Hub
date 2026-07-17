import type { ReactElement, ReactNode } from 'react';
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
import { UserTypesModuleProvider } from '@features/user-types';
import { HierarchyModuleProvider } from '@features/hierarchy';
import { PermissionsModuleProvider } from '@features/permissions';
import { DashboardModuleProvider } from '@features/dashboard';
import type { AppComposition } from '@app/di/composition-root';

export interface FeatureProvidersProps {
  readonly composition: AppComposition;
  readonly children: ReactNode;
}

/**
 * Nests every feature module provider (and the auth store) around the app. Kept out of `App` so the
 * root component stays small; the ordering is irrelevant since the providers are independent.
 */
export const FeatureProviders = ({
  composition,
  children,
}: FeatureProvidersProps): ReactElement => (
  <AuthStoreProvider store={composition.authStore}>
    <CoursesModuleProvider module={composition.coursesModule}>
      <TutorialsModuleProvider module={composition.tutorialsModule}>
        <ResourcesModuleProvider module={composition.resourcesModule}>
          <CertificatesModuleProvider module={composition.certificatesModule}>
            <SubmissionsModuleProvider module={composition.submissionsModule}>
              <CourseReviewsModuleProvider module={composition.courseReviewsModule}>
                <TeamModuleProvider module={composition.teamModule}>
                  <AssignmentsModuleProvider module={composition.assignmentsModule}>
                    <NotificationsModuleProvider module={composition.notificationsModule}>
                      <UsersModuleProvider module={composition.usersModule}>
                        <QuizzesModuleProvider module={composition.quizzesModule}>
                          <UserTypesModuleProvider module={composition.userTypesModule}>
                            <HierarchyModuleProvider module={composition.hierarchyModule}>
                              <PermissionsModuleProvider
                                module={composition.permissionsModule}
                              >
                                <DashboardModuleProvider
                                  module={composition.dashboardModule}
                                >
                                  {children}
                                </DashboardModuleProvider>
                              </PermissionsModuleProvider>
                            </HierarchyModuleProvider>
                          </UserTypesModuleProvider>
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
);
