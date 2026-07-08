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
    readonly baseUrl: string;
  };
  readonly logLevel: LogLevel;
  /** Optional Sentry DSN. When absent, error reporting stays disabled. */
  readonly sentryDsn?: string;
}

const EnvSchema = z.object({
  // Defaulted so the demo runs with zero setup: this build serves all data from in-memory
  // gateways, so the HTTP base URL is never actually called. Set VITE_API_BASE_URL in .env.local
  // (and bind an HTTP gateway) to point at a real backend.
  VITE_API_BASE_URL: z
    .string()
    .url('VITE_API_BASE_URL must be a valid URL')
    .default('http://localhost/api'),
  VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'silent']).default('info'),
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
    // Only present when actually configured, so `=== undefined` checks stay meaningful.
    ...(sentryDsn !== undefined && sentryDsn.length > 0 ? { sentryDsn } : {}),
  });
};
