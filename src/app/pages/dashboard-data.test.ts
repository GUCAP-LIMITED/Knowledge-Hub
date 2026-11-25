import { describe, expect, it } from 'vitest';
import {
  resolveUserTier,
  subtitleFor,
  buildActions,
  type DashCtx,
} from './dashboard-data';
import type { MyCapabilities } from '@features/users';

const canWith =
  (granted: readonly string[]): MyCapabilities['can'] =>
  (moduleId, cap) =>
    granted.includes(`${moduleId}.${cap}`);

const sampleCtx: DashCtx = {
  pending: 3,
  coursesCount: 10,
  completedCount: 4,
  inProgressCount: 2,
  certCount: 1,
  submissionsCount: 5,
  publishedCount: 2,
  rejectedCount: 0,
  usersCount: 25,
  continueTitle: 'React Architecture',
};

describe('dashboard-data', () => {
  describe('resolveUserTier', () => {
    it('resolves admin when the user can manage the dashboard', () => {
      expect(resolveUserTier(canWith(['dashboard.manage']))).toBe('admin');
    });

    it('resolves manager when the user can create submissions but not manage the dashboard', () => {
      expect(resolveUserTier(canWith(['submissions.create']))).toBe('manager');
    });

    it('resolves consultant when the user has neither capability', () => {
      expect(resolveUserTier(canWith([]))).toBe('consultant');
    });
  });

  describe('subtitleFor', () => {
    it('returns pending items count for admin', () => {
      expect(subtitleFor('admin', sampleCtx)).toBe('You have 3 items awaiting review.');
    });

    it('returns singular item for 1 pending item', () => {
      expect(subtitleFor('admin', { ...sampleCtx, pending: 1 })).toBe(
        'You have 1 item awaiting review.',
      );
    });

    it('returns continueTitle for non-admin when continueTitle exists', () => {
      expect(subtitleFor('consultant', sampleCtx)).toBe(
        'Pick up where you left off — “React Architecture”.',
      );
    });

    it('returns default fallback when no active courses', () => {
      expect(subtitleFor('consultant', { ...sampleCtx, continueTitle: null })).toBe(
        'No active courses. Browse the catalog to start learning.',
      );
    });
  });

  describe('buildActions', () => {
    it('returns the 4 quick actions for admin (Review Queue, Manage Content, Team Progress, Course Reviews)', () => {
      const actions = buildActions('admin', sampleCtx);
      expect(actions).toHaveLength(4);
      expect(actions.map((a) => a.label)).toEqual([
        'Review Queue',
        'Manage Content',
        'Team Progress',
        'Course Reviews',
      ]);
      expect(actions.map((a) => a.to)).toEqual([
        '/approvals',
        '/courses',
        '/team-progress',
        '/course-reviews',
      ]);
    });

    it('returns manager actions for manager', () => {
      const actions = buildActions('manager', sampleCtx);
      expect(actions).toHaveLength(4);
      expect(actions.map((a) => a.label)).toEqual([
        'Continue Learning',
        'Upload Document',
        'My Submissions',
        'Knowledge Base',
      ]);
    });

    it('returns learner actions for consultant', () => {
      const actions = buildActions('consultant', sampleCtx);
      expect(actions).toHaveLength(4);
      expect(actions.map((a) => a.label)).toEqual([
        'Resume Learning',
        'Browse Courses',
        'My Certificates',
        'Resources',
      ]);
    });
  });
});
