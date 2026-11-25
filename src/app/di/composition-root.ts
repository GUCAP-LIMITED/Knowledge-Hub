import { MutationCache, QueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react';
import { loadConfig } from '@core/config';
import { ConsoleLogger, type Logger } from '@core/logger';
import { SystemClock, type Clock } from '@core/time';
import {
  AuthRefreshHttpClient,
  FetchHttpClient,
  RetryHttpClient,
  TimeoutHttpClient,
  type HttpClient,
} from '@core/http';
import { MockHttpClient, buildMockRoutes, createMockState } from '@app/mock-api';
import { createAuthModule, type AuthStore, type KeyValueStorage } from '@features/auth';
import { createCoursesModule, type CoursesModule } from '@features/courses';
import { createTutorialsModule, type TutorialsModule } from '@features/tutorials';
import { createResourcesModule, type ResourcesModule } from '@features/resources';
import {
  createCertificatesModule,
  type CertificatesModule,
} from '@features/certificates';
import {
  createCertificateTemplatesModule,
  type CertificateTemplatesModule,
} from '@features/certificate-templates';
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
import { createTeamsModule, type TeamsModule } from '@features/teams';
import { createPermissionsModule, type PermissionsModule } from '@features/permissions';
import { createContentModule, type ContentModule } from '@features/content';
import { createDashboardModule, type DashboardModule } from '@features/dashboard';
import { createPlaybackModule, type PlaybackModule } from '@features/playback';
import { createMyLearningModule, type MyLearningModule } from '@features/my-learning';
import { createSearchModule, type SearchModule } from '@features/search';
import {
  createEmailTemplatesModule,
  type EmailTemplatesModule,
} from '@features/email-templates';

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
  readonly certificateTemplatesModule: CertificateTemplatesModule;
  readonly submissionsModule: SubmissionsModule;
  readonly courseReviewsModule: CourseReviewsModule;
  readonly teamModule: TeamModule;
  readonly assignmentsModule: AssignmentsModule;
  readonly notificationsModule: NotificationsModule;
  readonly usersModule: UsersModule;
  readonly quizzesModule: QuizzesModule;
  readonly userTypesModule: UserTypesModule;
  readonly teamsModule: TeamsModule;
  readonly permissionsModule: PermissionsModule;
  readonly contentModule: ContentModule;
  readonly dashboardModule: DashboardModule;
  readonly playbackModule: PlaybackModule;
  readonly myLearningModule: MyLearningModule;
  readonly searchModule: SearchModule;
  readonly emailTemplatesModule: EmailTemplatesModule;
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

interface AppHttpClientParams {
  readonly baseUrl: string;
  readonly logger: Logger;
  readonly getAuthToken: () => string | undefined;
  readonly refresh: () => Promise<boolean>;
}

/** The shared HTTP client: fetch → timeout → retry → auto-refresh-on-401 decorator chain. */
const createAppHttpClient = ({
  baseUrl,
  logger,
  getAuthToken,
  refresh,
}: AppHttpClientParams): HttpClient =>
  new AuthRefreshHttpClient(
    new RetryHttpClient(
      new TimeoutHttpClient(new FetchHttpClient({ baseUrl, logger, getAuthToken }), {
        timeoutMs: 30_000,
        logger,
      }),
      { logger },
    ),
    { refresh, logger },
  );

type FeatureModules = Omit<
  AppComposition,
  'logger' | 'errorNotifier' | 'authStore' | 'queryClient'
>;

interface CreateFeatureModulesInput {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
  readonly clock: Clock;
  /** `undefined` when there is no live backend (mock mode): disables the SSE stream. */
  readonly apiBaseUrl: string | undefined;
}

const createFeatureModules = ({
  httpClient,
  logger,
  clock,
  apiBaseUrl,
}: CreateFeatureModulesInput): FeatureModules => ({
  coursesModule: createCoursesModule({ httpClient, logger }),
  tutorialsModule: createTutorialsModule({ httpClient, logger }),
  resourcesModule: createResourcesModule({ httpClient, logger }),
  certificatesModule: createCertificatesModule({ httpClient, logger, clock }),
  certificateTemplatesModule: createCertificateTemplatesModule({
    httpClient,
    logger,
  }),
  submissionsModule: createSubmissionsModule({ httpClient, logger }),
  courseReviewsModule: createCourseReviewsModule({ logger, clock, httpClient }),
  teamModule: createTeamModule({ httpClient, logger }),
  assignmentsModule: createAssignmentsModule({ logger, httpClient }),
  notificationsModule: createNotificationsModule({
    httpClient,
    logger,
    ...(apiBaseUrl !== undefined ? { apiBaseUrl } : {}),
  }),
  usersModule: createUsersModule({ httpClient, logger }),
  quizzesModule: createQuizzesModule({ httpClient, logger }),
  userTypesModule: createUserTypesModule({ httpClient, logger }),
  teamsModule: createTeamsModule({ httpClient, logger }),
  permissionsModule: createPermissionsModule({ httpClient, logger }),
  contentModule: createContentModule({ httpClient, logger }),
  dashboardModule: createDashboardModule({ httpClient, logger }),
  playbackModule: createPlaybackModule({ httpClient }),
  myLearningModule: createMyLearningModule({ httpClient, logger }),
  searchModule: createSearchModule({ httpClient, logger }),
  emailTemplatesModule: createEmailTemplatesModule({ httpClient, logger }),
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

  const getAuthToken = (): string | undefined => accessToken;
  const httpClient: HttpClient = config.mockApi
    ? new MockHttpClient({
        routes: buildMockRoutes({ state: createMockState(), clock }),
        logger,
        getAuthToken,
      })
    : createAppHttpClient({
        baseUrl: config.api.baseUrl,
        logger,
        getAuthToken,
        refresh: () => refreshSession(),
      });

  // In mock mode the "Uapp Portal" is served by this same app (see `app/mock-portal`).
  const portalLoginUrl = config.mockApi
    ? `${window.location.origin}/mock-portal`
    : config.auth.portalLoginUrl;

  // Auth: SSO only — redirect to the Uapp Portal, exchange the returned `?token=` secret at the
  // OpenIddict `/connect/token` endpoint, and decode identity from the JWT.
  const authStore = createAuthModule({
    httpClient,
    clock,
    logger,
    storage,
    portal: { loginUrl: portalLoginUrl, key: config.auth.portalKey },
    oauth: { clientId: config.auth.clientId, scope: config.auth.scope },
    setAccessToken: (token) => {
      accessToken = token ?? undefined;
    },
  });

  refreshSession = () => authStore.getState().refreshSession();

  const featureModules = createFeatureModules({
    httpClient,
    logger,
    clock,
    apiBaseUrl: config.mockApi ? undefined : config.api.baseUrl,
  });

  logger.info('Application composition complete');

  return {
    logger,
    errorNotifier,
    authStore,
    ...featureModules,
    queryClient,
  };
};
