import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LESSON_KIND } from '@features/content';
import { LessonTypeIcon } from './LessonTypeIcon';
import { resolveLessonTypeMeta, getLessonIconComponent } from './lesson-type-meta';

describe('LessonTypeIcon and helpers', () => {
  describe('resolveLessonTypeMeta', () => {
    it('resolves string lesson kinds correctly', () => {
      expect(resolveLessonTypeMeta('video').key).toBe('video');
      expect(resolveLessonTypeMeta('video').label).toBe('Video');

      expect(resolveLessonTypeMeta('pdf').key).toBe('pdf');
      expect(resolveLessonTypeMeta('pdf').label).toBe('Document');

      expect(resolveLessonTypeMeta('quiz').key).toBe('quiz');
      expect(resolveLessonTypeMeta('quiz').label).toBe('Quiz');

      expect(resolveLessonTypeMeta('link').key).toBe('link');
      expect(resolveLessonTypeMeta('link').label).toBe('Link');

      expect(resolveLessonTypeMeta('assignment').key).toBe('assignment');
      expect(resolveLessonTypeMeta('assignment').label).toBe('Assignment');
    });

    it('resolves numeric lesson kinds correctly', () => {
      expect(resolveLessonTypeMeta(LESSON_KIND.video).key).toBe('video');
      expect(resolveLessonTypeMeta(LESSON_KIND.pdf).key).toBe('pdf');
      expect(resolveLessonTypeMeta(LESSON_KIND.quiz).key).toBe('quiz');
      expect(resolveLessonTypeMeta(LESSON_KIND.link).key).toBe('link');
      expect(resolveLessonTypeMeta(LESSON_KIND.assignment).key).toBe('assignment');
    });

    it('falls back gracefully on unknown kinds', () => {
      const fallback = resolveLessonTypeMeta(undefined);
      expect(fallback.label).toBe('Lesson');
      expect(fallback.color).toBe('var(--color-primary)');
    });
  });

  describe('getLessonIconComponent', () => {
    it('returns valid Lucide icon components', () => {
      expect(getLessonIconComponent('video')).toBeDefined();
      expect(getLessonIconComponent('pdf')).toBeDefined();
      expect(getLessonIconComponent('quiz')).toBeDefined();
      expect(getLessonIconComponent('link')).toBeDefined();
      expect(getLessonIconComponent('assignment')).toBeDefined();
    });
  });

  describe('LessonTypeIcon component', () => {
    it('renders icon with expected data-testid and size', () => {
      const { container } = render(<LessonTypeIcon kind="assignment" size={14} />);
      const icon = screen.getByTestId('lesson-type-icon-assignment');
      expect(icon).toBeInTheDocument();
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders all 5 content type icons', () => {
      const kinds = ['video', 'pdf', 'quiz', 'link', 'assignment'] as const;
      for (const kind of kinds) {
        const { unmount } = render(<LessonTypeIcon kind={kind} />);
        expect(screen.getByTestId(`lesson-type-icon-${kind}`)).toBeInTheDocument();
        unmount();
      }
    });

    it('renders quiz with success color', () => {
      render(<LessonTypeIcon kind="quiz" />);
      const icon = screen.getByTestId('lesson-type-icon-quiz');
      expect(icon).toHaveAttribute('stroke', 'var(--color-success)');
      expect(icon).toHaveAttribute('opacity', '0.9');
    });

    it('renders link with info color', () => {
      render(<LessonTypeIcon kind="link" />);
      const icon = screen.getByTestId('lesson-type-icon-link');
      expect(icon).toHaveAttribute('stroke', 'var(--color-info, var(--color-primary))');
      expect(icon).toHaveAttribute('opacity', '0.8');
    });
  });
});
