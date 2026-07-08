import type { LogLevel } from '@core/config/app-config';

export type LogMeta = Readonly<Record<string, unknown>>;

/**
 * Logging abstraction. UI and services depend on this interface, never on `console` directly,
 * so we can later swap in Sentry/structured logging without touching call sites.
 */
export interface Logger {
  debug(message: string, meta?: LogMeta): void;
  info(message: string, meta?: LogMeta): void;
  warn(message: string, meta?: LogMeta): void;
  error(message: string, error?: unknown, meta?: LogMeta): void;
  /** Create a scoped child logger that prefixes every message with `[scope]`. */
  child(scope: string): Logger;
}

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};

/** Default `Logger` backed by the browser console, gated by the configured minimum level. */
export class ConsoleLogger implements Logger {
  private readonly minWeight: number;

  public constructor(
    minLevel: LogLevel,
    private readonly scope?: string,
  ) {
    this.minWeight = LEVEL_WEIGHT[minLevel];
  }

  public debug(message: string, meta?: LogMeta): void {
    this.write('debug', console.debug, message, meta);
  }

  public info(message: string, meta?: LogMeta): void {
    this.write('info', console.info, message, meta);
  }

  public warn(message: string, meta?: LogMeta): void {
    this.write('warn', console.warn, message, meta);
  }

  public error(message: string, error?: unknown, meta?: LogMeta): void {
    if (this.minWeight > LEVEL_WEIGHT.error) {
      return;
    }
    console.error(this.format(message), { error, ...meta });
  }

  public child(scope: string): Logger {
    const nextScope = this.scope ? `${this.scope}:${scope}` : scope;
    const minLevel = (Object.keys(LEVEL_WEIGHT) as LogLevel[]).find(
      (level) => LEVEL_WEIGHT[level] === this.minWeight,
    );
    return new ConsoleLogger(minLevel ?? 'info', nextScope);
  }

  private write(
    level: Exclude<LogLevel, 'silent'>,
    sink: (message: string, meta?: unknown) => void,
    message: string,
    meta?: LogMeta,
  ): void {
    if (this.minWeight > LEVEL_WEIGHT[level]) {
      return;
    }
    if (meta) {
      sink(this.format(message), meta);
    } else {
      sink(this.format(message));
    }
  }

  private format(message: string): string {
    return this.scope ? `[${this.scope}] ${message}` : message;
  }
}
