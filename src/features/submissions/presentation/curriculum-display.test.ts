import { describe, it, expect } from 'vitest';
import { formatSectionDisplay, formatLessonDisplay } from './curriculum-display';

describe('curriculum-display formatter', () => {
  describe('formatSectionDisplay', () => {
    it('formats an untitled section with bracketed index badge and fallback title', () => {
      const result = formatSectionDisplay('', 0);
      expect(result.indexBadge).toBe('[1]');
      expect(result.ordinalLabel).toBe('Section 1');
      expect(result.title).toBe('');
      expect(result.displayTitle).toBe('Untitled Section');
      expect(result.isUntitled).toBe(true);
      expect(result.learnerPreview).toBe('Section 1: Untitled Section');
    });

    it('handles null/undefined and whitespace-only titles as untitled', () => {
      const nullResult = formatSectionDisplay(null, 1);
      expect(nullResult.indexBadge).toBe('[2]');
      expect(nullResult.isUntitled).toBe(true);
      expect(nullResult.displayTitle).toBe('Untitled Section');

      const spaceResult = formatSectionDisplay('   ', 2);
      expect(spaceResult.indexBadge).toBe('[3]');
      expect(spaceResult.isUntitled).toBe(true);
      expect(spaceResult.displayTitle).toBe('Untitled Section');
    });

    it('formats a titled section preserving trimmed title', () => {
      const result = formatSectionDisplay('  Introduction to Python  ', 0);
      expect(result.indexBadge).toBe('[1]');
      expect(result.ordinalLabel).toBe('Section 1');
      expect(result.title).toBe('Introduction to Python');
      expect(result.displayTitle).toBe('Introduction to Python');
      expect(result.isUntitled).toBe(false);
      expect(result.learnerPreview).toBe('Section 1: Introduction to Python');
    });
  });

  describe('formatLessonDisplay', () => {
    it('formats an untitled lesson with index badge and fallback title', () => {
      const result = formatLessonDisplay('', 0);
      expect(result.indexBadge).toBe('[1]');
      expect(result.ordinalLabel).toBe('Lesson 1');
      expect(result.title).toBe('');
      expect(result.displayTitle).toBe('Untitled Lesson');
      expect(result.isUntitled).toBe(true);
      expect(result.learnerPreview).toBe('Untitled Lesson');
    });

    it('formats a titled lesson preserving trimmed title', () => {
      const result = formatLessonDisplay('Setting Up IDE', 2);
      expect(result.indexBadge).toBe('[3]');
      expect(result.ordinalLabel).toBe('Lesson 3');
      expect(result.title).toBe('Setting Up IDE');
      expect(result.displayTitle).toBe('Setting Up IDE');
      expect(result.isUntitled).toBe(false);
      expect(result.learnerPreview).toBe('Setting Up IDE');
    });
  });
});
