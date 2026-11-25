import type { ReactElement, ReactNode } from 'react';
import { AuthStoreProvider } from '@features/auth';
import { CoursesModuleProvider } from '@features/courses';
import { TutorialsModuleProvider } from '@features/tutorials';
import { ResourcesModuleProvider } from '@features/resources';
import { CertificatesModuleProvider } from '@features/certificates';
import { CertificateTemplatesModuleProvider } from '@features/certificate-templates';
import { SubmissionsModuleProvider } from '@features/submissions';
import { CourseReviewsModuleProvider } from '@features/course-reviews';
import { TeamModuleProvider } from '@features/team';
import { AssignmentsModuleProvider } from '@features/assignments';
import { NotificationsModuleProvider } from '@features/notifications';
import { UsersModuleProvider } from '@features/users';
import { QuizzesModuleProvider } from '@features/quizzes';
import { UserTypesModuleProvider } from '@features/user-types';
import { TeamsModuleProvider } from '@features/teams';
import { PermissionsModuleProvider } from '@features/permissions';
import { ContentModuleProvider } from '@features/content';
import { DashboardModuleProvider } from '@features/dashboard';
import { PlaybackModuleProvider } from '@features/playback';
import { MyLearningModuleProvider } from '@features/my-learning';
import { SearchModuleProvider } from '@features/search';
import { EmailTemplatesModuleProvider } from '@features/email-templates';
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
            <SearchModuleProvider module={composition.searchModule}>
              <CertificateTemplatesModuleProvider
                module={composition.certificateTemplatesModule}
              >
                <SubmissionsModuleProvider module={composition.submissionsModule}>
                  <CourseReviewsModuleProvider module={composition.courseReviewsModule}>
                    <TeamModuleProvider module={composition.teamModule}>
                      <AssignmentsModuleProvider module={composition.assignmentsModule}>
                        <NotificationsModuleProvider
                          module={composition.notificationsModule}
                        >
                          <PlaybackModuleProvider module={composition.playbackModule}>
                            <UsersModuleProvider module={composition.usersModule}>
                              <QuizzesModuleProvider module={composition.quizzesModule}>
                                <UserTypesModuleProvider
                                  module={composition.userTypesModule}
                                >
                                  <TeamsModuleProvider module={composition.teamsModule}>
                                    <PermissionsModuleProvider
                                      module={composition.permissionsModule}
                                    >
                                      <DashboardModuleProvider
                                        module={composition.dashboardModule}
                                      >
                                        <ContentModuleProvider
                                          module={composition.contentModule}
                                        >
                                          <MyLearningModuleProvider
                                            module={composition.myLearningModule}
                                          >
                                            <EmailTemplatesModuleProvider
                                              module={composition.emailTemplatesModule}
                                            >
                                              {children}
                                            </EmailTemplatesModuleProvider>
                                          </MyLearningModuleProvider>
                                        </ContentModuleProvider>
                                      </DashboardModuleProvider>
                                    </PermissionsModuleProvider>
                                  </TeamsModuleProvider>
                                </UserTypesModuleProvider>
                              </QuizzesModuleProvider>
                            </UsersModuleProvider>
                          </PlaybackModuleProvider>
                        </NotificationsModuleProvider>
                      </AssignmentsModuleProvider>
                    </TeamModuleProvider>
                  </CourseReviewsModuleProvider>
                </SubmissionsModuleProvider>
              </CertificateTemplatesModuleProvider>
            </SearchModuleProvider>
          </CertificatesModuleProvider>
        </ResourcesModuleProvider>
      </TutorialsModuleProvider>
    </CoursesModuleProvider>
  </AuthStoreProvider>
);
