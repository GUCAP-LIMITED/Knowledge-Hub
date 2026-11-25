import { describe, expect, it } from 'vitest';
import { formatDuration, normalizeDuration, parseDuration } from '@shared/utils';

describe('Upload duration conversion & display synchronization', () => {
  it('converts plain numeric duration to total seconds (defaulting to minutes)', () => {
    // When a user types "23", the UI shows "= 23m" and sends 1380 seconds
    const rawInput = '23';
    const seconds = parseDuration(rawInput);
    expect(seconds).toBe(1380);

    // Review page formatting matches what the user saw
    expect(formatDuration(seconds)).toBe('23m');
  });

  it('converts composite and minute strings to exact seconds', () => {
    expect(parseDuration('23m')).toBe(1380);
    expect(parseDuration('23 min')).toBe(1380);
    expect(parseDuration('23 mins')).toBe(1380);
    expect(parseDuration('1h 30m')).toBe(5400);
    expect(parseDuration('1 hr 30 mins')).toBe(5400);
  });

  it('converts second strings to exact seconds', () => {
    expect(parseDuration('45s')).toBe(45);
    expect(parseDuration('23s')).toBe(23);
    expect(parseDuration('45 sec')).toBe(45);
    expect(parseDuration('45 secs')).toBe(45);
  });

  it('handles empty and zero durations gracefully', () => {
    expect(parseDuration('')).toBe(0);
    expect(parseDuration('   ')).toBe(0);
    expect(parseDuration('0')).toBe(0);
    expect(parseDuration('0m')).toBe(0);
  });

  it('keeps LearnerPreview display string and backend durationSeconds in sync', () => {
    const testCases: readonly {
      readonly input: string;
      readonly expectedDisplay: string;
      readonly expectedSeconds: number;
    }[] = [
      { input: '23', expectedDisplay: '23m', expectedSeconds: 1380 },
      { input: '23m', expectedDisplay: '23m', expectedSeconds: 1380 },
      { input: '23 min', expectedDisplay: '23m', expectedSeconds: 1380 },
      { input: '1h 30m', expectedDisplay: '1h 30m', expectedSeconds: 5400 },
      { input: '45s', expectedDisplay: '45s', expectedSeconds: 45 },
      { input: '23s', expectedDisplay: '23s', expectedSeconds: 23 },
    ];

    for (const { input, expectedDisplay, expectedSeconds } of testCases) {
      const display = normalizeDuration(input) || input;
      const seconds = parseDuration(input);

      expect(display).toBe(expectedDisplay);
      expect(seconds).toBe(expectedSeconds);
      expect(formatDuration(seconds)).toBe(expectedDisplay);
    }
  });
});
