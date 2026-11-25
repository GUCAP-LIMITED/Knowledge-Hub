import { describe, expect, it } from 'vitest';
import { formatNotificationTopic } from './format-topic';

describe('formatNotificationTopic', () => {
  it('formats PascalCase topic identifiers into spaced words', () => {
    expect(formatNotificationTopic('ContentSubmission')).toBe('Content Submission');
    expect(formatNotificationTopic('TrainingAssignment')).toBe('Training Assignment');
    expect(formatNotificationTopic('ContentModeration')).toBe('Content Moderation');
    expect(formatNotificationTopic('ContentCompletion')).toBe('Content Completion');
  });

  it('formats kebab-case and snake_case topic identifiers', () => {
    expect(formatNotificationTopic('content_submission')).toBe('Content Submission');
    expect(formatNotificationTopic('training-assignment')).toBe('Training Assignment');
  });

  it('handles already spaced string and mixed casings', () => {
    expect(formatNotificationTopic('Content Submission')).toBe('Content Submission');
    expect(formatNotificationTopic('content submission')).toBe('Content Submission');
  });

  it('handles alphanumeric topic identifiers', () => {
    expect(formatNotificationTopic('Quiz2Submission')).toBe('Quiz 2 Submission');
  });

  it('handles null, undefined, or empty values safely', () => {
    expect(formatNotificationTopic('')).toBe('');
    expect(formatNotificationTopic(null)).toBe('');
    expect(formatNotificationTopic(undefined)).toBe('');
  });
});
