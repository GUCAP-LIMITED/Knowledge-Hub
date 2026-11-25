import { describe, expect, it, vi } from 'vitest';
import {
  formatVideoTitle,
  formatVideoTimestamp,
  formatPlaylistDuration,
  computePlaylistTotalDuration,
  measureVideoDuration,
} from './tutorial-video-utils';

describe('tutorial-video-utils', () => {
  describe('formatVideoTitle', () => {
    it('strips common video extensions and normalizes separators', () => {
      expect(formatVideoTitle('01 - Introduction_To_ABP.mp4')).toBe(
        '01 Introduction To ABP',
      );
      expect(formatVideoTitle('getting_started_guide.webm')).toBe(
        'getting started guide',
      );
      expect(formatVideoTitle('lesson-2-deep-dive.mov')).toBe('lesson 2 deep dive');
    });

    it('handles empty or missing filename gracefully', () => {
      expect(formatVideoTitle('')).toBe('Video');
      expect(formatVideoTitle(null)).toBe('Video');
      expect(formatVideoTitle(undefined)).toBe('Video');
    });
  });

  describe('formatVideoTimestamp', () => {
    it('formats seconds to mm:ss format', () => {
      expect(formatVideoTimestamp(0)).toBe('00:00');
      expect(formatVideoTimestamp(45)).toBe('00:45');
      expect(formatVideoTimestamp(125)).toBe('02:05');
      expect(formatVideoTimestamp(750)).toBe('12:30');
    });

    it('formats hours into h:mm:ss format', () => {
      expect(formatVideoTimestamp(3665)).toBe('1:01:05');
      expect(formatVideoTimestamp(7322)).toBe('2:02:02');
    });
  });

  describe('measureVideoDuration', () => {
    it('resolves duration when video metadata loads', async () => {
      const mockFile = new File(['mock content'], 'test.mp4', { type: 'video/mp4' });
      /* eslint-disable-next-line @typescript-eslint/no-deprecated */
      const origCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        const el = origCreateElement(tagName);
        if (tagName === 'video') {
          setTimeout(() => {
            Object.defineProperty(el, 'duration', { value: 180, configurable: true });
            el.onloadedmetadata?.(new Event('loadedmetadata'));
          }, 10);
        }
        return el;
      });

      const duration = await measureVideoDuration(mockFile);
      expect(duration).toBe(180);
      vi.restoreAllMocks();
    });

    it('handles video error gracefully', async () => {
      const mockFile = new File(['bad content'], 'corrupted.mp4', { type: 'video/mp4' });
      /* eslint-disable-next-line @typescript-eslint/no-deprecated */
      const origCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        const el = origCreateElement(tagName);
        if (tagName === 'video') {
          setTimeout(() => {
            el.onerror?.(new Event('error'));
          }, 10);
        }
        return el;
      });

      const duration = await measureVideoDuration(mockFile);
      expect(duration).toBe(0);
      vi.restoreAllMocks();
    });
  });

  describe('formatPlaylistDuration', () => {
    it('returns --:-- when duration is zero, negative, or undefined', () => {
      expect(formatPlaylistDuration(0)).toBe('--:--');
      expect(formatPlaylistDuration(-5)).toBe('--:--');
      expect(formatPlaylistDuration(undefined)).toBe('--:--');
      expect(formatPlaylistDuration(null)).toBe('--:--');
    });

    it('formats valid durations normally and pads hours to 2 digits', () => {
      expect(formatPlaylistDuration(66)).toBe('01:06');
      expect(formatPlaylistDuration(750)).toBe('12:30');
      expect(formatPlaylistDuration(3600)).toBe('01:00:00');
      expect(formatPlaylistDuration(14493)).toBe('04:01:33');
    });
  });

  describe('computePlaylistTotalDuration', () => {
    it('sums positive durationSeconds across video items', () => {
      const items = [
        { durationSeconds: 750 },
        { durationSeconds: 14493 },
        { durationSeconds: 0 },
        { durationSeconds: undefined },
      ];
      expect(computePlaylistTotalDuration(items)).toBe(15243);
    });

    it('returns 0 for empty or invalid arrays', () => {
      expect(computePlaylistTotalDuration([])).toBe(0);
      expect(computePlaylistTotalDuration(undefined)).toBe(0);
    });
  });
});
