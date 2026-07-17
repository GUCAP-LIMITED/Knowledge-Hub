import { z } from 'zod';
import { ConfigError } from '@core/errors/app-error';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

/**
 * Strongly-typed, validated application configuration.
 *
 * Nothing in the app reads `import.meta.env` directly — that would scatter untyped, unvalidated
 * `string | undefined` access everywhere. Instead, env is validated *once* here and exposed as a
 * frozen, well-shaped object. A missing or malformed value fails fast at startup.
 */
export interface AppConfig {
  readonly api: {
    /** API host root (no `/api` suffix); data calls use absolute `/api/app/...`. */
    readonly baseUrl: string;
  };
  readonly logLevel: LogLevel;
  /** Uapp Portal SSO redirect + OpenIddict token-exchange configuration. */
  readonly auth: {
    readonly portalLoginUrl: string;
    readonly portalKey: string;
    readonly clientId: string;
    readonly scope: string;
  };
  /** Optional Sentry DSN. When absent, error reporting stays disabled. */
  readonly sentryDsn?: string;
}

const EnvSchema = z.object({
  // API host root (e.g. http://localhost:5080). `/connect/token` sits off the root; data endpoints
  // are absolute `/api/app/...`.
  VITE_API_BASE_URL: z
    .string()
    .url('VITE_API_BASE_URL must be a valid URL')
    .default('http://localhost:5080'),
  VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'silent']).default('info'),
  // Uapp Portal SSO login page the app redirects to; it returns with `?token=<secret>`.
  VITE_PORTAL_LOGIN_URL: z
    .string()
    .url('VITE_PORTAL_LOGIN_URL must be a valid URL')
    .optional(),
  VITE_PORTAL_KEY: z.string().default(''),
  VITE_OAUTH_CLIENT_ID: z.string().default('UappAcademy_App'),
  VITE_OAUTH_SCOPE: z.string().default('UappAcademy offline_access'),
  VITE_SENTRY_DSN: z.string().optional(),
});

/**
 * Validate raw environment values and project them into the `AppConfig` shape.
 * Exported (rather than only the singleton) so tests can exercise it with arbitrary input.
 */
export const loadConfig = (rawEnv: Record<string, unknown>): AppConfig => {
  const parsed = EnvSchema.safeParse(rawEnv);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new ConfigError(`Invalid environment configuration:\n${issues}`);
  }

  const env = parsed.data;
  const sentryDsn = env.VITE_SENTRY_DSN?.trim();

  return Object.freeze({
    api: Object.freeze({
      baseUrl: env.VITE_API_BASE_URL.replace(/\/+$/, ''),
    }),
    logLevel: env.VITE_LOG_LEVEL,
    auth: Object.freeze({
      portalLoginUrl: env.VITE_PORTAL_LOGIN_URL ?? '',
      portalKey: env.VITE_PORTAL_KEY,
      clientId: env.VITE_OAUTH_CLIENT_ID,
      scope: env.VITE_OAUTH_SCOPE,
    }),
    // Only present when actually configured, so `=== undefined` checks stay meaningful.
    ...(sentryDsn !== undefined && sentryDsn.length > 0 ? { sentryDsn } : {}),
  });
};
