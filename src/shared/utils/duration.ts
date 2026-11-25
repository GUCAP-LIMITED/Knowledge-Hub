export interface DurationParts {
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
  readonly totalSeconds: number;
}

export interface DurationFormatOptions {
  /** Text returned when duration is 0 or invalid. Default: 'N/A' */
  readonly emptyFallback?: string;
  /** Whether to output seconds component when > 0. Default: true */
  readonly includeSeconds?: boolean;
}

export interface DurationValidationOptions {
  /** Maximum allowed duration in seconds. Default: 360,000 (100 hours) */
  readonly maxSeconds?: number;
  /** Whether the field is mandatory (cannot be empty). Default: false */
  readonly required?: boolean;
  /** Whether 0 is permitted. Default: true */
  readonly allowZero?: boolean;
}

/**
 * Strict regex pattern enforcing [number]h [number]m [number]s order:
 * - Hours, minutes, and seconds must be in strict sequence: h -> m -> s
 * - Spaces between tokens are permitted (e.g. "1h 30m", "1 h 30 m")
 * - 0 is permitted (e.g. "0", "0h", "0m", "0s", "0h 0m 0s")
 * - Out-of-order units (e.g. "30m 1h", "10s 1h", "10s 30m") are rejected
 */
export const DURATION_INPUT_PATTERN =
  '(?:(\\d+(?:\\.\\d+)?)\\s*(?:h(?:ours?|rs?)?)(?:\\s*(\\d+(?:\\.\\d+)?)\\s*(?:m(?:in(?:ute)?s?)?))?(?:\\s*(\\d+(?:\\.\\d+)?)\\s*(?:s(?:ec(?:ond)?s?)?))?|(\\d+(?:\\.\\d+)?)\\s*(?:m(?:in(?:ute)?s?)?)(?:\\s*(\\d+(?:\\.\\d+)?)\\s*(?:s(?:ec(?:ond)?s?)?))?|(\\d+(?:\\.\\d+)?)\\s*(?:s(?:ec(?:ond)?s?)?)|\\d+(?:\\.\\d+)?|\\d{1,2}:\\d{2}(?::\\d{2})?)';

export const STRICT_DURATION_REGEX = new RegExp(`^${DURATION_INPUT_PATTERN}$`, 'i');

export const isValidDurationFormat = (trimmed: string): boolean =>
  STRICT_DURATION_REGEX.test(trimmed);

/**
 * Decomposes total seconds into normalized hours, minutes, and seconds components.
 * Example: 3902s -> { hours: 1, minutes: 5, seconds: 2, totalSeconds: 3902 }
 */
export const decomposeDuration = (totalSeconds: number): DurationParts => {
  const safeTotal = Math.max(
    0,
    Math.floor(Number.isFinite(totalSeconds) ? totalSeconds : 0),
  );
  const hours = Math.floor(safeTotal / 3600);
  const remainder = safeTotal % 3600;
  const minutes = Math.floor(remainder / 60);
  const seconds = remainder % 60;

  return {
    hours,
    minutes,
    seconds,
    totalSeconds: safeTotal,
  };
};

const parseColonFormat = (trimmed: string): number | null => {
  if (!/^\d{1,2}:\d{2}(?::\d{2})?$/.test(trimmed)) {
    return null;
  }
  const segments = trimmed.split(':').map((part) => Number.parseInt(part, 10) || 0);
  if (segments.length === 3) {
    return (segments[0] ?? 0) * 3600 + (segments[1] ?? 0) * 60 + (segments[2] ?? 0);
  }
  if (segments.length === 2) {
    return (segments[0] ?? 0) * 60 + (segments[1] ?? 0);
  }
  return null;
};

const resolveUnitFactor = (rawUnit: string): number | null => {
  const u = rawUnit.toLowerCase();
  if (u.startsWith('h')) return 3600;
  if (u.startsWith('m')) return 60;
  if (u.startsWith('s')) return 1;
  return null;
};

const parseUnitFormat = (trimmed: string): number | null => {
  const unitRegex = /(\d+(?:\.\d+)?)\s*([a-z]+)/gi;
  let match = unitRegex.exec(trimmed);
  if (match === null) {
    return null;
  }
  let totalSeconds = 0;
  while (match !== null) {
    const amount = Number.parseFloat(match[1] ?? '0');
    const factor = resolveUnitFactor(match[2] ?? '');
    if (factor === null) {
      return null;
    }
    totalSeconds += amount * factor;
    match = unitRegex.exec(trimmed);
  }
  return Math.round(totalSeconds);
};

const parsePlainNumber = (trimmed: string): number | null => {
  const plainNumber = Number.parseFloat(trimmed);
  if (!Number.isNaN(plainNumber) && plainNumber >= 0) {
    return Math.round(plainNumber * 60);
  }
  return null;
};

/**
 * Parses user input (string or number) into total seconds.
 * Supports:
 * - Composite units in strict order: "1h 30m 10s", "65m 2s", "45s", "2h", "1.5h"
 * - Colon-separated: "01:30:00", "05:30"
 * - Plain numbers (defaulted to minutes): "15" -> 900s, "0" -> 0s
 * Rejects out-of-order tokens (e.g. "30m 1h") by returning 0.
 */
const EMPTY_DURATION_TOKENS = new Set(['', 'n/a', '--:--', '--']);

export const parseDuration = (input: string | number | null | undefined): number => {
  if (typeof input === 'number') {
    return Number.isFinite(input) && input > 0 ? Math.floor(input) : 0;
  }

  if (typeof input !== 'string') {
    return 0;
  }

  const trimmed = input.trim().toLowerCase();
  if (EMPTY_DURATION_TOKENS.has(trimmed)) {
    return 0;
  }

  if (!isValidDurationFormat(trimmed)) {
    return 0;
  }

  const fromColon = parseColonFormat(trimmed);
  if (fromColon !== null) {
    return fromColon;
  }

  const fromUnits = parseUnitFormat(trimmed);
  if (fromUnits !== null) {
    return fromUnits;
  }

  const fromPlain = parsePlainNumber(trimmed);
  if (fromPlain !== null) {
    return fromPlain;
  }

  return 0;
};

/**
 * Formats total seconds into a canonical human string with hierarchical rollovers:
 * - 60s  -> "1m"
 * - 60m  -> "1h"
 * - 65m 2s -> "1h 5m 2s"
 * - 90m  -> "1h 30m"
 * - 3661s -> "1h 1m 1s"
 */
export const formatDuration = (
  seconds: number,
  options?: DurationFormatOptions,
): string => {
  const emptyFallback = options?.emptyFallback ?? 'N/A';
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return emptyFallback;
  }

  const { hours, minutes, seconds: secs } = decomposeDuration(seconds);
  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${String(hours)}h`);
  }
  if (minutes > 0) {
    parts.push(`${String(minutes)}m`);
  }
  if (options?.includeSeconds !== false && secs > 0) {
    parts.push(`${String(secs)}s`);
  }

  if (parts.length === 0) {
    return secs > 0 ? `${String(secs)}s` : emptyFallback;
  }

  return parts.join(' ');
};

/**
 * Translates and normalizes any user duration string or number into the canonical format.
 * Examples:
 * - "60m" -> "1h"
 * - "60s" -> "1m"
 * - "65m 2s" -> "1h 5m 2s"
 * - "90m" -> "1h 30m"
 * - "15" -> "15m"
 */
export const normalizeDuration = (input: string | number | null | undefined): string => {
  const totalSeconds = parseDuration(input);
  if (totalSeconds <= 0) {
    return '';
  }
  return formatDuration(totalSeconds, { emptyFallback: '' });
};

const checkDurationLimits = (
  seconds: number,
  allowZero: boolean,
  maxSeconds: number,
): string | undefined => {
  if (!allowZero && seconds <= 0) {
    return 'Duration must be greater than 0.';
  }
  if (seconds < 0) {
    return 'Duration cannot be negative.';
  }
  if (seconds > maxSeconds) {
    const maxHours = Math.round(maxSeconds / 3600);
    return `Duration must not exceed ${String(maxHours)} hours.`;
  }
  return undefined;
};

/**
 * Validates a user-entered duration string.
 * Returns an error message if invalid, or undefined if valid.
 */
export const validateDuration = (
  input: string | null | undefined,
  options?: DurationValidationOptions,
): string | undefined => {
  const maxSeconds = options?.maxSeconds ?? 360000; // 100 hours
  const isRequired = options?.required ?? false;
  const allowZero = options?.allowZero ?? true;

  const trimmed = (input ?? '').trim().toLowerCase();
  if (trimmed === '' || trimmed === 'n/a') {
    return isRequired ? 'Duration is required.' : undefined;
  }

  if (!isValidDurationFormat(trimmed)) {
    return 'Please enter a valid duration (e.g. 15m, 1h 30m, 45s).';
  }

  const seconds = parseDuration(trimmed);
  return checkDurationLimits(seconds, allowZero, maxSeconds);
};
