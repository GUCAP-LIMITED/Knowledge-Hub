import { describe, expect, it } from 'vitest';
import type { HttpClient, RequestOptions } from '@core/http';
import { isOk } from '@core/result';
import { silentLogger } from '@testing/fakes/silent-logger';
import { HttpCourseGateway } from './http-course-gateway';
import { buildCourseCatalogQuery } from './http-course-query';

const notImplemented = (): never => {
  throw new Error('not used in this test');
};

interface RecordedPost {
  readonly path: string;
  readonly body: unknown;
  readonly options: RequestOptions | undefined;
}

interface RecordedDelete {
  readonly path: string;
  readonly options: RequestOptions | undefined;
}

const makeHttpClient = (
  respond: (path: string) => Promise<unknown>,
  postCalls: RecordedPost[] = [],
  putCalls: RecordedPost[] = [],
  deleteCalls: RecordedDelete[] = [],
): HttpClient => ({
  get: <TResponse>(path: string): Promise<TResponse> =>
    respond(path) as Promise<TResponse>,
  post: <TResponse>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse> => {
    postCalls.push({ path, body, options });
    return respond(path) as Promise<TResponse>;
  },
  put: <TResponse>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse> => {
    putCalls.push({ path, body, options });
    return respond(path) as Promise<TResponse>;
  },
  patch: notImplemented,
  delete: <TResponse>(path: string, options?: RequestOptions): Promise<TResponse> => {
    deleteCalls.push({ path, options });
    return respond(path) as Promise<TResponse>;
  },
  postForm: notImplemented,
});

const makeGateway = (httpClient: HttpClient): HttpCourseGateway =>
  new HttpCourseGateway({ httpClient, logger: silentLogger() });

const COURSE_ROW = {
  id: 'course-1',
  title: 'Fullstack .NET & React Mastery',
  isCompleted: true,
  completedAt: '2026-09-03T12:30:00Z',
  certificateId: 'cert-1',
  certificateUrl: 'https://blob.example.com/certificates/cert-1.png',
  sections: [
    {
      id: 'section-1',
      title: 'Intro',
      lessons: [{ id: 'lesson-1', title: 'Lesson 1', kind: 0 }],
    },
  ],
  enrollments: [
    {
      id: 'enrollment-1',
      status: 30,
      statusName: 'Completed',
      progress: [
        {
          curriculumLessonId: 'lesson-1',
          lessonTitle: 'Lesson 1',
          isCompleted: true,
          completedAt: '2026-09-03T12:30:00Z',
        },
      ],
    },
  ],
};

describe('HttpCourseGateway.markLessonComplete', () => {
  it('sends enrollmentId/lessonId as query params with no JSON body', async () => {
    const postCalls: RecordedPost[] = [];
    const httpClient = makeHttpClient(() => Promise.resolve(COURSE_ROW), postCalls);
    await makeGateway(httpClient).markLessonComplete(
      'course-1',
      'enrollment-1',
      'lesson-1',
    );

    expect(postCalls).toEqual([
      {
        path: '/api/app/course/mark-lesson-complete',
        body: undefined,
        options: { query: { enrollmentId: 'enrollment-1', lessonId: 'lesson-1' } },
      },
    ]);
  });

  it('maps server completion + certificate fields onto the domain Course', async () => {
    const httpClient = makeHttpClient(() => Promise.resolve(COURSE_ROW));
    const result = await makeGateway(httpClient).markLessonComplete(
      'course-1',
      'enrollment-1',
      'lesson-1',
    );

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.isCompleted()).toBe(true);
      expect(result.value.completedAt).toBe('2026-09-03T12:30:00Z');
      expect(result.value.certificateId).toBe('cert-1');
      expect(result.value.certificateUrl).toBe(
        'https://blob.example.com/certificates/cert-1.png',
      );
      expect(result.value.progress).toBe(100);
    }
  });

  it('only counts progress entries explicitly marked complete', async () => {
    const httpClient = makeHttpClient(() =>
      Promise.resolve({
        ...COURSE_ROW,
        isCompleted: false,
        sections: [
          {
            id: 'section-1',
            title: 'Intro',
            lessons: [
              { id: 'lesson-1', title: 'Lesson 1', kind: 0 },
              { id: 'lesson-2', title: 'Lesson 2', kind: 0 },
            ],
          },
        ],
        enrollments: [
          {
            id: 'enrollment-1',
            status: 20,
            statusName: 'InProgress',
            progress: [
              {
                curriculumLessonId: 'lesson-1',
                lessonTitle: 'Lesson 1',
                isCompleted: true,
                completedAt: '2026-09-03T12:30:00Z',
              },
              {
                curriculumLessonId: 'lesson-2',
                lessonTitle: 'Lesson 2',
                isCompleted: false,
                completedAt: null,
              },
            ],
          },
        ],
      }),
    );
    const result = await makeGateway(httpClient).getById('course-1');

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.isCompleted()).toBe(false);
      expect(result.value.progress).toBe(50);
    }
  });
});

describe('HttpCourseGateway.addSection', () => {
  it('posts the title to /section/{courseId}', async () => {
    const postCalls: RecordedPost[] = [];
    const httpClient = makeHttpClient(() => Promise.resolve(COURSE_ROW), postCalls);
    await makeGateway(httpClient).addSection('course-1', 'New Section');

    expect(postCalls).toEqual([
      {
        path: '/api/app/course/section/course-1',
        body: { title: 'New Section' },
        options: undefined,
      },
    ]);
  });
});

describe('HttpCourseGateway.updateSection', () => {
  it('sends courseId/sectionId as query params with the title in the body', async () => {
    const putCalls: RecordedPost[] = [];
    const httpClient = makeHttpClient(() => Promise.resolve(COURSE_ROW), [], putCalls);
    await makeGateway(httpClient).updateSection('course-1', 'section-1', 'New title');

    expect(putCalls).toEqual([
      {
        path: '/api/app/course/section',
        body: { title: 'New title' },
        options: { query: { courseId: 'course-1', sectionId: 'section-1' } },
      },
    ]);
  });
});

describe('HttpCourseGateway.deleteSection', () => {
  it('sends courseId/sectionId as query params', async () => {
    const deleteCalls: RecordedDelete[] = [];
    const httpClient = makeHttpClient(
      () => Promise.resolve(COURSE_ROW),
      [],
      [],
      deleteCalls,
    );
    await makeGateway(httpClient).deleteSection('course-1', 'section-1');

    expect(deleteCalls).toEqual([
      {
        path: '/api/app/course/section',
        options: { query: { courseId: 'course-1', sectionId: 'section-1' } },
      },
    ]);
  });
});

describe('HttpCourseGateway.addLesson', () => {
  it('posts the lesson data to /lesson with courseId/sectionId as query params', async () => {
    const postCalls: RecordedPost[] = [];
    const httpClient = makeHttpClient(() => Promise.resolve(COURSE_ROW), postCalls);
    const data = { title: 'New Lesson', kind: 0, durationSeconds: 120 };
    await makeGateway(httpClient).addLesson('course-1', 'section-1', data);

    expect(postCalls).toEqual([
      {
        path: '/api/app/course/lesson',
        body: data,
        options: { query: { courseId: 'course-1', sectionId: 'section-1' } },
      },
    ]);
  });
});

describe('HttpCourseGateway.updateLesson', () => {
  it('puts the lesson data to /lesson with courseId/sectionId/lessonId as query params', async () => {
    const putCalls: RecordedPost[] = [];
    const httpClient = makeHttpClient(() => Promise.resolve(COURSE_ROW), [], putCalls);
    const data = { title: 'Updated Lesson', durationSeconds: 180 };
    await makeGateway(httpClient).updateLesson('course-1', 'section-1', 'lesson-1', data);

    expect(putCalls).toEqual([
      {
        path: '/api/app/course/lesson',
        body: data,
        options: {
          query: { courseId: 'course-1', sectionId: 'section-1', lessonId: 'lesson-1' },
        },
      },
    ]);
  });
});

describe('HttpCourseGateway.deleteLesson', () => {
  it('sends courseId/sectionId/lessonId as query params', async () => {
    const deleteCalls: RecordedDelete[] = [];
    const httpClient = makeHttpClient(
      () => Promise.resolve(COURSE_ROW),
      [],
      [],
      deleteCalls,
    );
    await makeGateway(httpClient).deleteLesson('course-1', 'section-1', 'lesson-1');

    expect(deleteCalls).toEqual([
      {
        path: '/api/app/course/lesson',
        options: {
          query: { courseId: 'course-1', sectionId: 'section-1', lessonId: 'lesson-1' },
        },
      },
    ]);
  });
});

describe('HttpCourseGateway.markHelpful', () => {
  it('calls POST mark-helpful and then fetches updated catalog item', async () => {
    const postCalls: RecordedPost[] = [];
    const helpfulRow = {
      ...COURSE_ROW,
      helpfulCount: 7,
      isHelpful: true,
    };
    const httpClient = makeHttpClient((path) => {
      if (path === '/api/app/course/course-1/mark-helpful') {
        return Promise.resolve({ helpfulCount: 7, isHelpful: true });
      }
      return Promise.resolve(helpfulRow);
    }, postCalls);

    const result = await makeGateway(httpClient).markHelpful('course-1');

    expect(postCalls).toEqual([
      {
        path: '/api/app/course/course-1/mark-helpful',
        body: undefined,
        options: undefined,
      },
    ]);
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.helpfulCount).toBe(7);
      expect(result.value.isHelpful).toBe(true);
    }
  });
});

describe('HttpCourseGateway.getEnrollmentStatuses', () => {
  it('fetches and maps enrollment statuses from /api/app/enum/EnrollmentStatus', async () => {
    const rawEnums = [
      { value: 0, name: 'NotStarted', description: 'Not Started' },
      { value: 5, name: 'InProgress', description: 'In Progress' },
      { value: 10, name: 'Paused', description: 'Paused' },
      { value: 15, name: 'Completed', description: 'Completed' },
      { value: 20, name: 'Dropped', description: 'Dropped' },
    ];
    const httpClient = makeHttpClient((path) => {
      if (path === '/api/app/enum/EnrollmentStatus') {
        return Promise.resolve(rawEnums);
      }
      return Promise.reject(new Error(`unexpected path: ${path}`));
    });

    const result = await makeGateway(httpClient).getEnrollmentStatuses();
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toEqual([
        { value: 0, label: 'Not Started', name: 'NotStarted' },
        { value: 5, label: 'In Progress', name: 'InProgress' },
        { value: 10, label: 'Paused', name: 'Paused' },
        { value: 15, label: 'Completed', name: 'Completed' },
        { value: 20, label: 'Dropped', name: 'Dropped' },
      ]);
    }
  });
});

describe('buildCourseCatalogQuery', () => {
  it('serializes status as numeric enum string', () => {
    const qs = buildCourseCatalogQuery({
      skipCount: 0,
      maxResultCount: 12,
      status: 0,
      sorting: 'popular',
    });
    expect(qs).toBe('?skipCount=0&maxResultCount=12&status=0&sorting=popular');
  });

  it('omits status when undefined', () => {
    const qs = buildCourseCatalogQuery({
      skipCount: 0,
      maxResultCount: 12,
      sorting: 'popular',
    });
    expect(qs).toBe('?skipCount=0&maxResultCount=12&sorting=popular');
  });
});
