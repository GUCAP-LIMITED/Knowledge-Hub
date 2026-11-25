import { describe, expect, it } from 'vitest';
import { buildCourse } from '@testing';
import { courseActionState } from './course-action-state';

describe('courseActionState', () => {
  it('returns the Completed state once the course is finished', () => {
    const course = buildCourse({ isEnrolled: true, progress: 100 });

    expect(courseActionState(course)).toEqual({
      label: 'Completed',
      variant: 'ghost',
      disabled: true,
    });
  });

  it('returns the Enrolled state when enrolled but not yet completed', () => {
    const course = buildCourse({ isEnrolled: true, progress: 40 });

    expect(courseActionState(course)).toEqual({
      label: 'Enrolled',
      variant: 'ghost',
      disabled: true,
    });
  });

  it('returns the Enroll state when not enrolled', () => {
    const course = buildCourse({ isEnrolled: false, progress: 0 });

    expect(courseActionState(course)).toEqual({
      label: 'Enroll',
      variant: 'default',
      disabled: false,
    });
  });
});
