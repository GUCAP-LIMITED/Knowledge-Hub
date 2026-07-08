import { describe, expect, it } from 'vitest';
import { buildCourse } from '@testing';

describe('Course', () => {
  it('reports completion at 100% progress', () => {
    expect(buildCourse({ progress: 100 }).isCompleted()).toBe(true);
    expect(buildCourse({ progress: 40 }).isCompleted()).toBe(false);
  });

  it('reports started once progress is above zero', () => {
    expect(buildCourse({ progress: 0 }).hasStarted()).toBe(false);
    expect(buildCourse({ progress: 1 }).hasStarted()).toBe(true);
  });

  it('clamps progress into 0..100 and returns a new instance', () => {
    const course = buildCourse({ progress: 20 });
    const advanced = course.withProgress(150);
    expect(advanced).not.toBe(course);
    expect(advanced.progress).toBe(100);
    expect(course.progress).toBe(20);
  });
});
