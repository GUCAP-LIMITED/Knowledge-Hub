import { Course, type CourseProps } from '@features/courses/domain';

export type CourseOverrides = Partial<CourseProps>;

const DEFAULT_COURSE: CourseProps = {
  id: 'course-1',
  title: 'Getting Started with UAPP Portal',
  category: 'Onboarding',
  duration: '2h',
  lessons: 8,
  mandatory: false,
  rating: 4.8,
  enrolled: 245,
  addedDate: new Date('2024-01-05T00:00:00.000Z'),
  outcomes: ['Navigate the portal confidently'],
  progress: 0,
};

/** Construct a valid {@link Course} for tests, overriding only what matters per case. */
export const buildCourse = (overrides: CourseOverrides = {}): Course =>
  new Course({ ...DEFAULT_COURSE, ...overrides });
