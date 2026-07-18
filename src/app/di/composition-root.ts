import { MutationCache, QueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react';
import { loadConfig } from '@core/config';
import { ConsoleLogger, type Logger } from '@core/logger';
import { SystemClock } from '@core/time';
import {
  AuthRefreshHttpClient,
  FetchHttpClient,
  RetryHttpClient,
  TimeoutHttpClient,
} from '@core/http';
import { createAuthModule, type AuthStore, type KeyValueStorage } from '@features/auth';
import { createCoursesModule, type CoursesModule } from '@features/courses';
import { createTutorialsModule, type TutorialsModule } from '@features/tutorials';
import { createResourcesModule, type ResourcesModule } from '@features/resources';
import {
  createCertificatesModule,
  type CertificatesModule,
} from '@features/certificates';
import { createSubmissionsModule, type SubmissionsModule } from '@features/submissions';

import {
  createCourseReviewsModule,
  type CourseReviewsModule,
} from '@features/course-reviews';

import { createTeamModule, type TeamModule } from '@features/team';
import { createAssignmentsModule, type AssignmentsModule } from '@features/assignments';
import {
  createNotificationsModule,
  type NotificationsModule,
} from '@features/notifications';
import { createUsersModule, type UsersModule } from '@features/users';
import { createQuizzesModule, type QuizzesModule } from '@features/quizzes';
import { createUserTypesModule, type UserTypesModule } from '@features/user-types';
import { createHierarchyModule, type HierarchyModule } from '@features/hierarchy';
import { createPermissionsModule, type PermissionsModule } from '@features/permissions';
import { createContentModule, type ContentModule } from '@features/content';
import { createDashboardModule, type DashboardModule } from '@features/dashboard';

/**
 * A late-bound sink for surfacing mutation failures as UI toasts. The QueryClient is built before
 * React mounts, so `ToastErrorBridge` binds the real toast handler once the provider is live.
 */
export interface ErrorNotifier {
  readonly notify: (message: string) => void;
  readonly bind: (sink: (message: string) => void) => void;
}

const createErrorNotifier = (): ErrorNotifier => {
  let sink: (message: string) => void = () => undefined;
  return {
    notify: (message: string): void => {
      sink(message);
    },
    bind: (next: (message: string) => void): void => {
      sink = next;
    },
  };
};

export interface AppComposition {
  readonly logger: Logger;
  readonly errorNotifier: ErrorNotifier;
  readonly authStore: AuthStore;
  readonly coursesModule: CoursesModule;
  readonly tutorialsModule: TutorialsModule;
  readonly resourcesModule: ResourcesModule;
  readonly certificatesModule: CertificatesModule;
  readonly submissionsModule: SubmissionsModule;
  readonly courseReviewsModule: CourseReviewsModule;
  readonly teamModule: TeamModule;
  readonly assignmentsModule: AssignmentsModule;
  readonly notificationsModule: NotificationsModule;
  readonly usersModule: UsersModule;
  readonly quizzesModule: QuizzesModule;
  readonly userTypesModule: UserTypesModule;
  readonly hierarchyModule: HierarchyModule;
  readonly permissionsModule: PermissionsModule;
  readonly contentModule: ContentModule;
  readonly dashboardModule: DashboardModule;
  readonly queryClient: QueryClient;
}

export interface CompositionInput {
  readonly env: Record<string, unknown>;
  readonly storage: KeyValueStorage;
}

let sentryInitialized = false;

const initSentry = (dsn: string | undefined, environment: string): void => {
  if (dsn === undefined || sentryInitialized) {
    return;
  }
  Sentry.init({ dsn, environment });
  sentryInitialized = true;
};

/** The shared QueryClient, wired so every failed mutation surfaces through the error notifier. */
const createAppQueryClient = (errorNotifier: ErrorNotifier): QueryClient =>
  new QueryClient({
    mutationCache: new MutationCache({
      onError: (error: unknown): void => {
        errorNotifier.notify(
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.',
        );
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

/**
 * THE composition root. The one place that knows concrete implementations and wires the whole
 * graph. Feature data is served by in-memory gateways seeded from the prototype (no backend yet);
 * binding an HTTP gateway inside a feature module is the only change needed to go live.
 */
export const createComposition = ({ env, storage }: CompositionInput): AppComposition => {
  const config = loadConfig(env);
  const logger = new ConsoleLogger(config.logLevel, 'app');
  const clock = new SystemClock();

  initSentry(config.sentryDsn, import.meta.env.MODE);

  const errorNotifier = createErrorNotifier();
  const queryClient = createAppQueryClient(errorNotifier);

  let accessToken: string | undefined;
  let refreshSession: () => Promise<boolean> = () => Promise.resolve(false);

  const httpClient = new AuthRefreshHttpClient(
    new RetryHttpClient(
      new TimeoutHttpClient(
        new FetchHttpClient({
          baseUrl: config.api.baseUrl,
          logger,
          getAuthToken: () => accessToken,
        }),
        { timeoutMs: 15_000, logger },
      ),
      { logger },
    ),
    { refresh: () => refreshSession(), logger },
  );

  // Auth: SSO only — redirect to the Uapp Portal, exchange the returned `?token=` secret at the
  // OpenIddict `/connect/token` endpoint, and decode identity from the JWT.
  const authStore = createAuthModule({
    httpClient,
    clock,
    logger,
    storage,
    portal: { loginUrl: config.auth.portalLoginUrl, key: config.auth.portalKey },
    oauth: { clientId: config.auth.clientId, scope: config.auth.scope },
    setAccessToken: (token) => {
      accessToken = token ?? undefined;
    },
  });

  refreshSession = () => authStore.getState().refreshSession();

  const coursesModule = createCoursesModule({ logger });
  const tutorialsModule = createTutorialsModule({ logger });
  const resourcesModule = createResourcesModule({ logger });
  const certificatesModule = createCertificatesModule({ logger, clock });
  const submissionsModule = createSubmissionsModule({ httpClient, logger });
  const courseReviewsModule = createCourseReviewsModule({ logger, clock });
  const teamModule = createTeamModule({ logger });
  const assignmentsModule = createAssignmentsModule({ logger });
  const notificationsModule = createNotificationsModule({ logger });
  const usersModule = createUsersModule({ logger });
  const quizzesModule = createQuizzesModule({ logger });
  const userTypesModule = createUserTypesModule({ httpClient, logger });
  const hierarchyModule = createHierarchyModule({ httpClient, logger });
  const permissionsModule = createPermissionsModule({ httpClient, logger });
  const contentModule = createContentModule({ httpClient, logger });
  const dashboardModule = createDashboardModule({ httpClient, logger });

  logger.info('Application composition complete');

  return {
    logger,
    errorNotifier,
    authStore,
    coursesModule,
    tutorialsModule,
    resourcesModule,
    certificatesModule,
    submissionsModule,
    courseReviewsModule,
    teamModule,
    assignmentsModule,
    notificationsModule,
    usersModule,
    quizzesModule,
    userTypesModule,
    hierarchyModule,
    permissionsModule,
    contentModule,
    dashboardModule,
    queryClient,
  };
};
