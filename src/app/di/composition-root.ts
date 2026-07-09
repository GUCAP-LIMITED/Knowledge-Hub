import { QueryClient } from '@tanstack/react-query';
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
import { createContentModule, type ContentModule } from '@features/content';
import {
  createNotificationsModule,
  type NotificationsModule,
} from '@features/notifications';

export interface AppComposition {
  readonly logger: Logger;
  readonly authStore: AuthStore;
  readonly coursesModule: CoursesModule;
  readonly tutorialsModule: TutorialsModule;
  readonly resourcesModule: ResourcesModule;
  readonly certificatesModule: CertificatesModule;
  readonly submissionsModule: SubmissionsModule;
  readonly courseReviewsModule: CourseReviewsModule;
  readonly teamModule: TeamModule;
  readonly assignmentsModule: AssignmentsModule;
  readonly contentModule: ContentModule;
  readonly notificationsModule: NotificationsModule;
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

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

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

  // Demo auth: the in-memory directory authenticates the seeded UAPP accounts offline.
  const authStore = createAuthModule({
    httpClient,
    clock,
    logger,
    storage,
    demoAuth: true,
    setAccessToken: (token) => {
      accessToken = token ?? undefined;
    },
  });

  refreshSession = () => authStore.getState().refreshSession();

  const coursesModule = createCoursesModule({ logger });
  const tutorialsModule = createTutorialsModule({ logger });
  const resourcesModule = createResourcesModule({ logger });
  const certificatesModule = createCertificatesModule({ logger });
  const submissionsModule = createSubmissionsModule({ logger, clock });
  const courseReviewsModule = createCourseReviewsModule({ logger, clock });
  const teamModule = createTeamModule({ logger });
  const assignmentsModule = createAssignmentsModule({ logger });
  const contentModule = createContentModule({ logger, clock });
  const notificationsModule = createNotificationsModule({ logger });

  logger.info('Application composition complete');

  return {
    logger,
    authStore,
    coursesModule,
    tutorialsModule,
    resourcesModule,
    certificatesModule,
    submissionsModule,
    courseReviewsModule,
    teamModule,
    assignmentsModule,
    contentModule,
    notificationsModule,
    queryClient,
  };
};
