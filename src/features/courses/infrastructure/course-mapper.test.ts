import { describe, expect, it } from 'vitest';
import { CourseRowSchema } from './dto/course-api.dto';
import { toCourse } from './course-mapper';

describe('toCourse completed-lesson resolution', () => {
  it('merges enrollment progress and per-lesson isCompleted flags', () => {
    const row = CourseRowSchema.parse({
      id: 'course-1',
      title: 'Course',
      sections: [
        {
          id: 'section-1',
          title: 'Intro',
          lessons: [
            { id: 'lesson-1', title: 'Lesson 1', kind: 0, isCompleted: true },
            { id: 'lesson-2', title: 'Lesson 2', kind: 0 },
            { id: 'lesson-3', title: 'Lesson 3', kind: 0 },
          ],
        },
      ],
      enrollments: [
        {
          id: 'enrollment-1',
          status: 10,
          progress: [{ curriculumLessonId: 'lesson-2', isCompleted: true }],
        },
      ],
    });

    const course = toCourse(row);

    expect(course.completedLessons).toEqual(
      expect.arrayContaining(['lesson-1', 'lesson-2']),
    );
    expect(course.completedLessons).toHaveLength(2);
    expect(course.progress).toBe(67);
  });

  it('falls back to lesson-level isCompleted when no enrollment progress is present', () => {
    const row = CourseRowSchema.parse({
      id: 'course-1',
      title: 'Course',
      sections: [
        {
          id: 'section-1',
          title: 'Intro',
          lessons: [{ id: 'lesson-1', title: 'Lesson 1', kind: 0, isCompleted: true }],
        },
      ],
    });

    const course = toCourse(row);

    expect(course.completedLessons).toEqual(['lesson-1']);
    expect(course.progress).toBe(100);
  });

  it('marks progress as 100 when isCompleted or isCourseCompleted is true', () => {
    const row = CourseRowSchema.parse({
      id: 'course-completed',
      title: 'Practice course',
      isCompleted: true,
      sections: [],
    });

    const course = toCourse(row);
    expect(course.isCompleted()).toBe(true);
    expect(course.progress).toBe(100);
  });

  it('falls back to row.progress when sections are empty', () => {
    const row = CourseRowSchema.parse({
      id: 'course-in-progress',
      title: 'In Progress Course',
      progress: 50,
      sections: [],
    });

    const course = toCourse(row);
    expect(course.progress).toBe(50);
  });

  it('uses totalLessons for course lessons and progress calculation when provided', () => {
    const row = CourseRowSchema.parse({
      id: 'course-with-total-lessons',
      title: 'Total Lessons Course',
      totalLessons: 10,
      sections: [],
      enrollments: [
        {
          id: 'enrollment-1',
          status: 10,
          progress: [
            { curriculumLessonId: 'lesson-1', isCompleted: true },
            { curriculumLessonId: 'lesson-2', isCompleted: true },
          ],
        },
      ],
    });

    const course = toCourse(row);
    expect(course.lessons).toBe(10);
    expect(course.completedLessons).toHaveLength(2);
    expect(course.progress).toBe(20);
  });

  it('falls back to row.progress when totalLessons is provided but completedLessons is empty', () => {
    const row = CourseRowSchema.parse({
      id: 'course-with-no-completed-lessons',
      title: 'No Completed Lessons Course',
      totalLessons: 10,
      progress: 30,
      sections: [],
    });

    const course = toCourse(row);
    expect(course.lessons).toBe(10);
    expect(course.completedLessons).toHaveLength(0);
    expect(course.progress).toBe(30);
  });

  it('maps isPreview correctly for preview lessons and defaults to false when omitted', () => {
    const row = CourseRowSchema.parse({
      id: 'course-preview',
      title: 'Preview Test Course',
      sections: [
        {
          id: 'sec-1',
          title: 'Section 1',
          lessons: [
            { id: 'les-1', title: 'Free Preview Lesson', kind: 0, isPreview: true },
            { id: 'les-2', title: 'Regular Lesson', kind: 0 },
          ],
        },
      ],
    });

    const course = toCourse(row);
    expect(course.sections[0]?.lessons[0]?.isPreview).toBe(true);
    expect(course.sections[0]?.lessons[1]?.isPreview).toBe(false);
  });

  it('maps canModify correctly and defaults to false when omitted', () => {
    const rowWithCanModify = CourseRowSchema.parse({
      id: 'course-can-modify',
      title: 'Can Modify Course',
      canModify: true,
    });
    expect(toCourse(rowWithCanModify).canModify).toBe(true);

    const rowDefault = CourseRowSchema.parse({
      id: 'course-default',
      title: 'Default Course',
    });
    expect(toCourse(rowDefault).canModify).toBe(false);
  });

  it('maps slug when present and falls back to id when omitted', () => {
    const withSlug = CourseRowSchema.parse({
      id: 'course-123',
      title: 'Course with Slug',
      slug: 'course-with-slug',
    });
    expect(toCourse(withSlug).slug).toBe('course-with-slug');

    const withoutSlug = CourseRowSchema.parse({
      id: 'course-456',
      title: 'Course without Slug',
    });
    expect(toCourse(withoutSlug).slug).toBe('course-456');
  });
});
