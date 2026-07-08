import { ConsoleLogger, type Logger } from '@core/logger';

/** A logger that emits nothing — keeps test output clean. */
export const silentLogger = (): Logger => new ConsoleLogger('silent');
