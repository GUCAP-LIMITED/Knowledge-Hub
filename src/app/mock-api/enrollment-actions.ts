import { allLessons } from './course-view';
import type { MockState } from './mock-state';
import type { CourseSeed } from './seed/course-seed';
import type { MockEnrollment } from './seed/enrollment-seed';

/** Marks one lesson done and rolls the enrolment forward (in progress, or completed when all are). */
export const completeLessonFor = (
  course: CourseSeed,
  enrollment: MockEnrollment,
  lessonId: string,
  at: string,
): void => {
  enrollment.completedLessons.set(lessonId, at);
  const allDone = allLessons(course).every((l) => enrollment.completedLessons.has(l.id));
  Object.assign(enrollment, {
    lastAccessedAt: at,
    status: allDone ? 15 : 5,
    completedAt: allDone ? at : null,
  });
};

/** Passing a quiz completes the quiz lesson in every course the learner is enrolled in. */
export const completeQuizLessons = (
  state: MockState,
  userId: string,
  quizId: string,
  at: string,
): void => {
  for (const enrollment of state.enrollments.filter((e) => e.userId === userId)) {
    const course = state.courses.find((c) => c.id === enrollment.courseId);
    const lesson =
      course === undefined
        ? undefined
        : allLessons(course).find((l) => l.quizId === quizId);
    if (course !== undefined && lesson !== undefined) {
      completeLessonFor(course, enrollment, lesson.id, at);
    }
  }
};
