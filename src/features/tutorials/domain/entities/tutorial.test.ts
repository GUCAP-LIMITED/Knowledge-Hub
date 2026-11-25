import { describe, expect, it } from 'vitest';
import { buildTutorial } from '@testing';

describe('Tutorial', () => {
  it('reports beginner-friendly for the Beginner tier', () => {
    expect(buildTutorial({ difficulty: 'Beginner' }).isBeginnerFriendly()).toBe(true);
  });

  it('reports not beginner-friendly for harder tiers', () => {
    expect(buildTutorial({ difficulty: 'Intermediate' }).isBeginnerFriendly()).toBe(
      false,
    );
    expect(buildTutorial({ difficulty: 'Advanced' }).isBeginnerFriendly()).toBe(false);
  });

  it('correctly tracks isQuizRequired and updates with withDetails', () => {
    const tutorial = buildTutorial({ quizId: 'quiz-1', isQuizRequired: true });
    expect(tutorial.isQuizRequired).toBe(true);
    expect(tutorial.quizId).toBe('quiz-1');

    const updated = tutorial.withDetails({
      title: 'Updated Title',
      category: 'General',
      duration: '10m',
      difficulty: 'Beginner',
      description: 'Updated desc',
      isQuizRequired: false,
    });
    expect(updated.isQuizRequired).toBe(false);
    expect(updated.title).toBe('Updated Title');
  });

  it('reports completion and certificate fields from the server, defaulting to unset', () => {
    expect(buildTutorial().isCompleted()).toBe(false);
    expect(buildTutorial().certificateUrl).toBeNull();

    const completed = buildTutorial({
      completed: true,
      certificateId: 'cert-1',
      certificateUrl: 'https://example.com/cert.png',
    });
    expect(completed.isCompleted()).toBe(true);
    expect(completed.certificateId).toBe('cert-1');
    expect(completed.certificateUrl).toBe('https://example.com/cert.png');
  });

  it('preserves completion fields across withDetails edits', () => {
    const tutorial = buildTutorial({ completed: true, certificateId: 'cert-1' });
    const updated = tutorial.withDetails({
      title: 'Updated Title',
      category: 'General',
      duration: '10m',
      difficulty: 'Beginner',
      description: 'Updated desc',
    });
    expect(updated.isCompleted()).toBe(true);
    expect(updated.certificateId).toBe('cert-1');
  });

  it('tracks canModify and defaults to false when omitted', () => {
    expect(buildTutorial().canModify).toBe(false);
    expect(buildTutorial({ canModify: true }).canModify).toBe(true);
  });

  it('preserves canModify across withDetails and withHelpfulVote', () => {
    const tutorial = buildTutorial({ canModify: true });
    const updatedDetails = tutorial.withDetails({
      title: 'Updated Title',
      category: 'General',
      duration: '10m',
      difficulty: 'Beginner',
      description: 'Updated desc',
    });
    expect(updatedDetails.canModify).toBe(true);

    const updatedVote = tutorial.withHelpfulVote(5, true);
    expect(updatedVote.canModify).toBe(true);
  });
});
