import { describe, expect, it } from 'vitest';
import {
  decomposeDuration,
  formatDuration,
  normalizeDuration,
  parseDuration,
  validateDuration,
} from './duration';

describe('shared duration utils', () => {
  describe('decomposeDuration', () => {
    it('decomposes seconds into hours, minutes, and seconds', () => {
      expect(decomposeDuration(3902)).toEqual({
        hours: 1,
        minutes: 5,
        seconds: 2,
        totalSeconds: 3902,
      });

      expect(decomposeDuration(3600)).toEqual({
        hours: 1,
        minutes: 0,
        seconds: 0,
        totalSeconds: 3600,
      });

      expect(decomposeDuration(60)).toEqual({
        hours: 0,
        minutes: 1,
        seconds: 0,
        totalSeconds: 60,
      });

      expect(decomposeDuration(45)).toEqual({
        hours: 0,
        minutes: 0,
        seconds: 45,
        totalSeconds: 45,
      });

      expect(decomposeDuration(0)).toEqual({
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
      });
    });
  });

  describe('parseDuration', () => {
    it('returns 0 for empty or invalid input', () => {
      expect(parseDuration('')).toBe(0);
      expect(parseDuration('   ')).toBe(0);
      expect(parseDuration('N/A')).toBe(0);
      expect(parseDuration('n/a')).toBe(0);
      expect(parseDuration(null)).toBe(0);
      expect(parseDuration(undefined)).toBe(0);
      expect(parseDuration(0)).toBe(0);
      expect(parseDuration(-10)).toBe(0);
    });

    it('passes through raw numeric seconds', () => {
      expect(parseDuration(900)).toBe(900);
      expect(parseDuration(3600)).toBe(3600);
    });

    it('parses plain numbers as minutes', () => {
      expect(parseDuration('15')).toBe(900);
      expect(parseDuration('60')).toBe(3600);
      expect(parseDuration('0')).toBe(0);
    });

    it('parses composite durations with strict h -> m -> s order', () => {
      expect(parseDuration('15m')).toBe(900);
      expect(parseDuration('1h')).toBe(3600);
      expect(parseDuration('1h 30m')).toBe(5400);
      expect(parseDuration('45s')).toBe(45);
      expect(parseDuration('2h 15m 10s')).toBe(8110);
      expect(parseDuration('65m 2s')).toBe(3902);
      expect(parseDuration('1.5h')).toBe(5400);
      expect(parseDuration('0h 0m 0s')).toBe(0);
      expect(parseDuration('0m')).toBe(0);
    });

    it('parses natural word units (min, mins, hr, hrs, sec, secs)', () => {
      expect(parseDuration('23 min')).toBe(1380);
      expect(parseDuration('23 mins')).toBe(1380);
      expect(parseDuration('1 hr')).toBe(3600);
      expect(parseDuration('1 hr 30 min')).toBe(5400);
      expect(parseDuration('1 hr 30 mins')).toBe(5400);
      expect(parseDuration('45 sec')).toBe(45);
      expect(parseDuration('45 secs')).toBe(45);
    });

    it('rejects out of order units by returning 0', () => {
      expect(parseDuration('30m 1h')).toBe(0);
      expect(parseDuration('10s 1h')).toBe(0);
      expect(parseDuration('10s 30m')).toBe(0);
      expect(parseDuration('1h 1h')).toBe(0);
    });

    it('parses colon-separated time strings', () => {
      expect(parseDuration('01:30:00')).toBe(5400);
      expect(parseDuration('05:30')).toBe(330);
    });
  });

  describe('formatDuration', () => {
    it('formats seconds into canonical human-readable strings with rollovers', () => {
      // User requirements: 60s -> 1m, 60m -> 1h, 65m 2s -> 1h 5m 2s
      expect(formatDuration(60)).toBe('1m');
      expect(formatDuration(3600)).toBe('1h');
      expect(formatDuration(3902)).toBe('1h 5m 2s');
      expect(formatDuration(5400)).toBe('1h 30m');
      expect(formatDuration(45)).toBe('45s');
      expect(formatDuration(3661)).toBe('1h 1m 1s');
    });

    it('handles 0 and negative durations using emptyFallback', () => {
      expect(formatDuration(0)).toBe('N/A');
      expect(formatDuration(-10)).toBe('N/A');
      expect(formatDuration(0, { emptyFallback: '' })).toBe('');
      expect(formatDuration(0, { emptyFallback: 'None' })).toBe('None');
    });

    it('respects includeSeconds option', () => {
      expect(formatDuration(3902, { includeSeconds: false })).toBe('1h 5m');
      expect(formatDuration(45, { includeSeconds: false })).toBe('45s');
    });
  });

  describe('normalizeDuration', () => {
    it('normalizes various user inputs to canonical translated format', () => {
      expect(normalizeDuration('60s')).toBe('1m');
      expect(normalizeDuration('60m')).toBe('1h');
      expect(normalizeDuration('65m 2s')).toBe('1h 5m 2s');
      expect(normalizeDuration('90m')).toBe('1h 30m');
      expect(normalizeDuration('3600s')).toBe('1h');
      expect(normalizeDuration('3661s')).toBe('1h 1m 1s');
      expect(normalizeDuration('15')).toBe('15m');
      expect(normalizeDuration('23 min')).toBe('23m');
      expect(normalizeDuration('1 hr 30 mins')).toBe('1h 30m');
      expect(normalizeDuration('1.5h')).toBe('1h 30m');
      expect(normalizeDuration('')).toBe('');
      expect(normalizeDuration('n/a')).toBe('');
      expect(normalizeDuration(3902)).toBe('1h 5m 2s');
    });
  });

  describe('validateDuration', () => {
    it('allows valid inputs in strict [number]h [number]m [number]s order', () => {
      expect(validateDuration('')).toBeUndefined();
      expect(validateDuration('   ')).toBeUndefined();
      expect(validateDuration('N/A')).toBeUndefined();
      expect(validateDuration('1h 30m 10s')).toBeUndefined();
      expect(validateDuration('1h 30m')).toBeUndefined();
      expect(validateDuration('1h 10s')).toBeUndefined();
      expect(validateDuration('30m 10s')).toBeUndefined();
      expect(validateDuration('1h')).toBeUndefined();
      expect(validateDuration('15m')).toBeUndefined();
      expect(validateDuration('45s')).toBeUndefined();
      expect(validateDuration('65m 2s')).toBeUndefined();
      expect(validateDuration('15')).toBeUndefined();
      expect(validateDuration('23 min')).toBeUndefined();
      expect(validateDuration('1 hr 30 mins')).toBeUndefined();
      expect(validateDuration('01:30:00')).toBeUndefined();
    });

    it('allows spaces between tokens and between number and unit', () => {
      expect(validateDuration('1h 30m')).toBeUndefined();
      expect(validateDuration('1h  30m')).toBeUndefined();
      expect(validateDuration('1 h 30 m')).toBeUndefined();
      expect(validateDuration('1 h  30 m  10 s')).toBeUndefined();
    });

    it('allows number 0 (0, 0h, 0m, 0s, 0h 0m 0s)', () => {
      expect(validateDuration('0')).toBeUndefined();
      expect(validateDuration('0h')).toBeUndefined();
      expect(validateDuration('0m')).toBeUndefined();
      expect(validateDuration('0s')).toBeUndefined();
      expect(validateDuration('0h 0m 0s')).toBeUndefined();
      expect(validateDuration('0h 0m')).toBeUndefined();
      expect(validateDuration('0m 0s')).toBeUndefined();
    });

    it('rejects 0 when allowZero is explicitly false', () => {
      expect(validateDuration('0', { allowZero: false })).toBe(
        'Duration must be greater than 0.',
      );
    });

    it('rejects out of order units (m then h, s then h, s then m)', () => {
      expect(validateDuration('30m 1h')).toBe(
        'Please enter a valid duration (e.g. 15m, 1h 30m, 45s).',
      );
      expect(validateDuration('10s 1h')).toBe(
        'Please enter a valid duration (e.g. 15m, 1h 30m, 45s).',
      );
      expect(validateDuration('10s 30m')).toBe(
        'Please enter a valid duration (e.g. 15m, 1h 30m, 45s).',
      );
      expect(validateDuration('30m 1h 10s')).toBe(
        'Please enter a valid duration (e.g. 15m, 1h 30m, 45s).',
      );
      expect(validateDuration('1h 1h')).toBe(
        'Please enter a valid duration (e.g. 15m, 1h 30m, 45s).',
      );
      expect(validateDuration('30m 30m')).toBe(
        'Please enter a valid duration (e.g. 15m, 1h 30m, 45s).',
      );
      expect(validateDuration('10s 10s')).toBe(
        'Please enter a valid duration (e.g. 15m, 1h 30m, 45s).',
      );
    });

    it('rejects required empty inputs when required=true', () => {
      expect(validateDuration('', { required: true })).toBe('Duration is required.');
    });

    it('rejects non-numeric gibberish', () => {
      expect(validateDuration('abc')).toBe(
        'Please enter a valid duration (e.g. 15m, 1h 30m, 45s).',
      );
      expect(validateDuration('10 foo')).toBe(
        'Please enter a valid duration (e.g. 15m, 1h 30m, 45s).',
      );
    });

    it('rejects values exceeding maxSeconds', () => {
      expect(validateDuration('101h')).toBe('Duration must not exceed 100 hours.');
    });
  });
});
