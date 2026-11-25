import { describe, expect, it } from 'vitest';
import { buildCurriculum } from './course-curriculum-utils';
import { buildCourse } from '@testing';

describe('buildCurriculum', () => {
  it('maps isPreview correctly for free preview and standard lessons', () => {
    const course = buildCourse({
      id: 'course-preview-test',
      isEnrolled: false,
      sections: [
        {
          id: 'sec-1',
          title: 'Introduction',
          lessons: [
            {
              id: 'les-1',
              title: 'Welcome (Preview)',
              durationSeconds: 120,
              kind: 'video',
              mediaAssetId: 'media-1',
              quizId: null,
              externalUrl: null,
              isPreview: true,
            },
            {
              id: 'les-2',
              title: 'Deep Dive (Locked)',
              durationSeconds: 300,
              kind: 'video',
              mediaAssetId: 'media-2',
              quizId: null,
              externalUrl: null,
              isPreview: false,
            },
          ],
        },
      ],
    });

    const curriculum = buildCurriculum(course);
    expect(curriculum).toHaveLength(1);
    expect(curriculum[0]?.lessons).toHaveLength(2);

    const [firstLesson, secondLesson] = curriculum[0]!.lessons;
    expect(firstLesson?.isPreview).toBe(true);
    expect(firstLesson?.duration).toBe('2 min');

    expect(secondLesson?.isPreview).toBe(false);
    expect(secondLesson?.duration).toBe('5 min');
  });

  it('marks current lesson only when enrolled', () => {
    const unenrolledCourse = buildCourse({
      isEnrolled: false,
      sections: [
        {
          id: 'sec-1',
          title: 'Section 1',
          lessons: [
            {
              id: 'les-1',
              title: 'Lesson 1',
              durationSeconds: 60,
              kind: 'video',
              mediaAssetId: null,
              quizId: null,
              externalUrl: null,
              isPreview: true,
            },
          ],
        },
      ],
    });

    const enrolledCourse = buildCourse({
      isEnrolled: true,
      sections: [
        {
          id: 'sec-1',
          title: 'Section 1',
          lessons: [
            {
              id: 'les-1',
              title: 'Lesson 1',
              durationSeconds: 60,
              kind: 'video',
              mediaAssetId: null,
              quizId: null,
              externalUrl: null,
              isPreview: true,
            },
          ],
        },
      ],
    });

    const unenrolledCurriculum = buildCurriculum(unenrolledCourse);
    expect(unenrolledCurriculum[0]?.lessons[0]?.current).toBe(false);

    const enrolledCurriculum = buildCurriculum(enrolledCourse);
    expect(enrolledCurriculum[0]?.lessons[0]?.current).toBe(true);
  });
});
