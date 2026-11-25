import { formatDuration, parseDuration, validateDuration } from '@shared/utils';

/**
 * Parses human-entered duration strings (e.g. "1h 30m", "15m", "45s", "15") into total seconds.
 * Delegated to the centralized `@shared/utils/duration`.
 */
export const parseDurationInput = (value: string): number => parseDuration(value);

/**
 * Formats total seconds into a canonical human-friendly string (e.g. "1h 30m", "15m", "45s").
 * Delegated to the centralized `@shared/utils/duration`.
 */
export const formatDurationDisplay = (seconds: number): string => formatDuration(seconds);

/**
 * Validates duration input strings.
 * Delegated to the centralized `@shared/utils/duration`.
 */
export const validateDurationInput = (value: string): string | undefined =>
  validateDuration(value);
