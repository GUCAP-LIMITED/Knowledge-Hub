import { describe, expect, it } from 'vitest';
import {
  formatDurationDisplay,
  parseDurationInput,
  validateDurationInput,
} from './duration-parser';

describe('duration-parser', () => {
  describe('parseDurationInput', () => {
    it('returns 0 for empty or N/A input', () => {
      expect(parseDurationInput('')).toBe(0);
      expect(parseDurationInput('   ')).toBe(0);
      expect(parseDurationInput('N/A')).toBe(0);
      expect(parseDurationInput('n/a')).toBe(0);
    });

    it('parses plain numbers as minutes', () => {
      expect(parseDurationInput('15')).toBe(900);
      expect(parseDurationInput('60')).toBe(3600);
      expect(parseDurationInput('0')).toBe(0);
    });

    it('parses composite durations with units', () => {
      expect(parseDurationInput('15m')).toBe(900);
      expect(parseDurationInput('1h')).toBe(3600);
      expect(parseDurationInput('1h 30m')).toBe(5400);
      expect(parseDurationInput('45s')).toBe(45);
      expect(parseDurationInput('2h 15m 10s')).toBe(8110);
    });
  });

  describe('validateDurationInput', () => {
    it('allows empty or N/A input', () => {
      expect(validateDurationInput('')).toBeUndefined();
      expect(validateDurationInput('   ')).toBeUndefined();
      expect(validateDurationInput('N/A')).toBeUndefined();
    });

    it('allows valid duration formats', () => {
      expect(validateDurationInput('15m')).toBeUndefined();
      expect(validateDurationInput('1h 30m')).toBeUndefined();
      expect(validateDurationInput('45s')).toBeUndefined();
      expect(validateDurationInput('15')).toBeUndefined();
    });

    it('rejects non-numeric gibberish', () => {
      expect(validateDurationInput('abc')).toBe(
        'Please enter a valid duration (e.g. 15m, 1h 30m, 45s).',
      );
      expect(validateDurationInput('10 foo')).toBe(
        'Please enter a valid duration (e.g. 15m, 1h 30m, 45s).',
      );
    });

    it('allows number 0 as valid duration', () => {
      expect(validateDurationInput('0')).toBeUndefined();
      expect(validateDurationInput('0m')).toBeUndefined();
      expect(validateDurationInput('0s')).toBeUndefined();
    });

    it('rejects out of order units', () => {
      expect(validateDurationInput('30m 1h')).toBe(
        'Please enter a valid duration (e.g. 15m, 1h 30m, 45s).',
      );
      expect(validateDurationInput('10s 1h')).toBe(
        'Please enter a valid duration (e.g. 15m, 1h 30m, 45s).',
      );
    });

    it('rejects durations exceeding 100 hours', () => {
      expect(validateDurationInput('101h')).toBe('Duration must not exceed 100 hours.');
    });
  });

  describe('formatDurationDisplay', () => {
    it('formats seconds into minutes', () => {
      expect(formatDurationDisplay(900)).toBe('15m');
      expect(formatDurationDisplay(3600)).toBe('1h');
      expect(formatDurationDisplay(60)).toBe('1m');
      expect(formatDurationDisplay(45)).toBe('45s');
      expect(formatDurationDisplay(90)).toBe('1m 30s');
      expect(formatDurationDisplay(0)).toBe('N/A');
      expect(formatDurationDisplay(-10)).toBe('N/A');
    });
  });
});
