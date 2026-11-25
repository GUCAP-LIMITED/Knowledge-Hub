import { describe, expect, it } from 'vitest';
import { MyLearningItem } from './my-learning-item';

const createSampleItem = (
  overrides?: Partial<ConstructorParameters<typeof MyLearningItem>[0]>,
): MyLearningItem =>
  new MyLearningItem({
    id: 'course-1',
    assignmentId: 'assign-1',
    enrollmentId: 'enroll-1',
    certificateId: null,
    certificateUrl: null,
    title: 'Intro to ABP Framework',
    subtitle: 'Learn modern ABP',
    description: 'Comprehensive course',
    contentType: 'course',
    contentTypeName: 'Course',
    origin: 'assigned',
    originName: 'Assigned',
    assignedScope: 'team',
    assignedScopeName: 'My Team',
    status: 'inProgress',
    statusName: 'In Progress',
    progress: 45,
    dueDate: new Date('2026-10-01'),
    isOverdue: false,
    daysRemaining: 15,
    enrolledOrAssignedAt: new Date('2026-09-01'),
    lastAccessedAt: new Date('2026-09-05'),
    completedAt: null,
    totalLessons: 10,
    completedLessons: 4,
    durationSeconds: 3600,
    difficultyName: 'Intermediate',
    categoryName: 'Backend',
    topic: 'DotNet',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    actionLabel: 'Resume Learning',
    ...overrides,
  });

describe('MyLearningItem Entity', () => {
  it('correctly identifies assigned course', () => {
    const item = createSampleItem();
    expect(item.isAssigned()).toBe(true);
    expect(item.isSelf()).toBe(false);
    expect(item.isCourse()).toBe(true);
    expect(item.isTutorial()).toBe(false);
    expect(item.isResource()).toBe(false);
  });

  it('formats duration in hours and minutes', () => {
    const item = createSampleItem({ durationSeconds: 3660 });
    expect(item.formattedDuration()).toBe('1h 1m');
  });

  it('formats short duration in minutes', () => {
    const item = createSampleItem({ durationSeconds: 1500 });
    expect(item.formattedDuration()).toBe('25m');
  });

  it('correctly reports completion and overdue status', () => {
    const inProgress = createSampleItem({ status: 'inProgress' });
    expect(inProgress.isCompleted()).toBe(false);

    const completed = createSampleItem({ status: 'completed' });
    expect(completed.isCompleted()).toBe(true);

    const overdue = createSampleItem({ status: 'overdue', isOverdue: true });
    expect(overdue.isOverdue).toBe(true);
  });
});
