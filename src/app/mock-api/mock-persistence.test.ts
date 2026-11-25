import { describe, expect, it } from 'vitest';
import {
  clearMockState,
  restoreMockState,
  saveMockState,
  type SnapshotStorage,
} from './mock-persistence';
import { createMockState } from './mock-state';

const memoryStorage = (): SnapshotStorage & { readonly size: () => number } => {
  const items = new Map<string, string>();
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => {
      items.set(key, value);
    },
    removeItem: (key) => {
      items.delete(key);
    },
    size: () => items.size,
  };
};

describe('mock state persistence', () => {
  it('restores arrays, maps, sets and nested objects into a fresh state', () => {
    const storage = memoryStorage();
    const first = createMockState(new Date('2026-11-25T10:00:00Z'));
    first.helpfulVotes.add('user-consultant:course-welcome');
    first.dashboards.set('user-admin', [{ widgetKey: 'courses.active' }]);
    first.enrollments
      .find((e) => e.userId === 'user-consultant' && e.courseId === 'course-admissions')
      ?.completedLessons.set('les-a-3', 'x');
    first.platformSettings.ratings = false;
    saveMockState(first, storage);

    const second = createMockState(new Date('2026-11-25T11:00:00Z'));
    expect(restoreMockState(second, storage)).toBe(true);
    expect(second.helpfulVotes.has('user-consultant:course-welcome')).toBe(true);
    expect(second.dashboards.get('user-admin')).toEqual([
      { widgetKey: 'courses.active' },
    ]);
    expect(
      second.enrollments
        .find((e) => e.userId === 'user-consultant' && e.courseId === 'course-admissions')
        ?.completedLessons.has('les-a-3'),
    ).toBe(true);
    expect(second.platformSettings.ratings).toBe(false);
    expect(second.now.toISOString()).toBe('2026-11-25T11:00:00.000Z');
  });

  it('ignores a snapshot from another version or a corrupt one', () => {
    const storage = memoryStorage();
    storage.setItem('uapp:mock-state', JSON.stringify({ version: 999, state: {} }));
    expect(restoreMockState(createMockState(), storage)).toBe(false);
    storage.setItem('uapp:mock-state', '{not json');
    expect(restoreMockState(createMockState(), storage)).toBe(false);
    expect(storage.size()).toBe(0);
  });

  it('forgets the snapshot on demand', () => {
    const storage = memoryStorage();
    saveMockState(createMockState(), storage);
    clearMockState(storage);
    expect(restoreMockState(createMockState(), storage)).toBe(false);
  });
});
