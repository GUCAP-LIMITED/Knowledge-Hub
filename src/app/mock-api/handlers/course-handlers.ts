import type { Clock } from '@core/time';
import { ratingOf } from '../content-index';
import { completeLessonFor } from '../enrollment-actions';
import { notFound, paginate, requireUser, sortBy } from '../mock-context';
import { nextId, type MockState } from '../mock-state';
import { MockHttpFailure, type MockRequest, type MockRoute } from '../mock-types';
import {
  allLessons,
  categoryNameOf,
  courseDurationSeconds,
  findEnrollment,
  toCourseRow,
} from '../course-view';
import { courseCategoryId, type CourseSeed } from '../seed/course-seed';
import type { MockEnrollment } from '../seed/enrollment-seed';

const BASE = '/api/app/course';

const findCourse = (state: MockState, idOrSlug: string): CourseSeed => {
  const course = state.courses.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
  if (course === undefined) {
    throw notFound('Course');
  }
  return course;
};

const matchesFilter = (state: MockState, course: CourseSeed, filter: string): boolean => {
  const needle = filter.trim().toLowerCase();
  return (
    needle.length === 0 ||
    [course.title, course.subtitle, categoryNameOf(state, course)].some((text) =>
      text.toLowerCase().includes(needle),
    )
  );
};

const sorters = (
  state: MockState,
): Record<string, (item: CourseSeed) => string | number> => ({
  title: (c: CourseSeed): string => c.title,
  creationtime: (c: CourseSeed): number => Date.parse(c.createdAt),
  rating: (c: CourseSeed): number => ratingOf(state, c.id).average,
  duration: (c: CourseSeed): number => courseDurationSeconds(c),
  enrollmentcount: (c: CourseSeed): number => c.enrollmentCount,
});

const completeLesson = (
  state: MockState,
  clock: Clock,
  enrollment: MockEnrollment,
  lessonId: string,
): void => {
  const course = findCourse(state, enrollment.courseId);
  if (!allLessons(course).some((lesson) => lesson.id === lessonId)) {
    throw notFound('Lesson');
  }
  completeLessonFor(course, enrollment, lessonId, clock.now().toISOString());
};

const enroll = (state: MockState, clock: Clock, request: MockRequest): unknown => {
  const user = requireUser(request);
  const course = findCourse(state, request.params.id ?? '');
  if (findEnrollment(state, user.id, course.id) === undefined) {
    state.enrollments.push({
      id: nextId(state, 'enr'),
      userId: user.id,
      courseId: course.id,
      status: 0,
      completedLessons: new Map(),
      origin: 1,
      assignedScope: null,
      dueDate: null,
      enrolledAt: clock.now().toISOString(),
      lastAccessedAt: null,
      completedAt: null,
    });
  }
  return toCourseRow(state, course, user);
};

export const courseHandlers = (state: MockState, clock: Clock): readonly MockRoute[] => [
  {
    method: 'GET',
    pattern: `${BASE}/catalog`,
    handler: (request) => {
      const user = requireUser(request);
      const { filter = '', categoryId, category, sorting } = request.query;
      const matches = state.courses.filter(
        (course) =>
          matchesFilter(state, course, filter) &&
          (categoryId === undefined || courseCategoryId(course) === categoryId) &&
          (category === undefined || categoryNameOf(state, course) === category),
      );
      const page = paginate(sortBy(matches, sorting, sorters(state)), request.query);
      return {
        items: page.items.map((c) => toCourseRow(state, c, user)),
        totalCount: page.totalCount,
      };
    },
  },
  {
    method: 'GET',
    pattern: `${BASE}/:id/catalog-item`,
    handler: (request) =>
      toCourseRow(
        state,
        findCourse(state, request.params.id ?? ''),
        requireUser(request),
      ),
  },
  {
    method: 'POST',
    pattern: `${BASE}/:id/enroll`,
    handler: (request) => enroll(state, clock, request),
  },
  {
    method: 'POST',
    pattern: `${BASE}/mark-lesson-complete`,
    handler: (request) => {
      const user = requireUser(request);
      const enrollment = state.enrollments.find(
        (e) => e.id === request.query.enrollmentId && e.userId === user.id,
      );
      if (enrollment === undefined || request.query.lessonId === undefined) {
        throw new MockHttpFailure(400, 'Unknown enrollment or lesson');
      }
      completeLesson(state, clock, enrollment, request.query.lessonId);
      return toCourseRow(state, findCourse(state, enrollment.courseId), user);
    },
  },
  {
    method: 'POST',
    pattern: `${BASE}/:id/mark-helpful`,
    handler: (request) => {
      const user = requireUser(request);
      const key = `${user.id}:${findCourse(state, request.params.id ?? '').id}`;
      if (state.helpfulVotes.has(key)) {
        state.helpfulVotes.delete(key);
      } else {
        state.helpfulVotes.add(key);
      }
      return null;
    },
  },
];
