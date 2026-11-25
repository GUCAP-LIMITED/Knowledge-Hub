import { describe, expect, it } from 'vitest';
import type { Lesson, Section } from './upload-content-types';
import {
  firstStudioIssue,
  studioIssues,
  lessonIssues,
  lessonNeedsMedia,
  missingStudio,
  sectionHasIssues,
  sectionOwnIssues,
} from './curriculum-validation';

const thumb = { thumbnail: [new File(['x'], 'thumb.png', { type: 'image/png' })] };
const video = (over: Partial<Lesson> = {}): Lesson => ({
  id: 'l1',
  title: 'Intro',
  kind: 'video',
  file: new File(['x'], 'a.mp4', { type: 'video/mp4' }),
  ...over,
});
const section = (over: Partial<Section> = {}): Section => ({
  id: 's1',
  title: 'Basics',
  lessons: [video()],
  ...over,
});

describe('lessonIssues', () => {
  it('is empty for a complete video lesson', () => {
    expect(lessonIssues(video())).toEqual([]);
  });

  it('flags a missing title and missing media', () => {
    const { file: _file, ...noFile } = video({ title: '  ' });
    expect(lessonIssues(noFile)).toEqual([
      'All lesson titles',
      'Media for all video/pdf lessons',
    ]);
  });

  it('flags a quiz lesson without questions', () => {
    expect(lessonIssues({ id: 'q', title: 'Q1', kind: 'quiz' })).toEqual([
      'Quiz "Q1" needs at least one question',
    ]);
  });

  it('only video and pdf lessons need media', () => {
    expect(lessonNeedsMedia({ id: 'a', title: 'A', kind: 'assignment' })).toBe(false);
  });
});

describe('sectionOwnIssues', () => {
  it('flags an untitled section with no lessons', () => {
    expect(sectionOwnIssues(section({ title: '', lessons: [] }))).toEqual([
      'All section titles',
      'At least one lesson per section',
    ]);
  });

  it('sectionHasIssues also looks at the lessons', () => {
    const { file: _file, ...noFile } = video();
    expect(sectionHasIssues(section({ lessons: [noFile] }))).toBe(true);
    expect(sectionHasIssues(section())).toBe(false);
  });
});

describe('missingStudio', () => {
  it('requires a thumbnail and at least one section', () => {
    expect(missingStudio({}, [])).toEqual(['Course thumbnail', 'At least one section']);
  });

  it('is empty once everything is filled in', () => {
    expect(missingStudio(thumb, [section()])).toEqual([]);
  });

  it('de-duplicates repeated issues across sections', () => {
    const empty = section({ title: '' });
    expect(missingStudio(thumb, [empty, { ...empty, id: 's2' }])).toEqual([
      'All section titles',
    ]);
  });
});

describe('firstStudioIssue', () => {
  it('points at course media first when the thumbnail is missing', () => {
    expect(firstStudioIssue({}, [section({ title: '' })])).toEqual({ type: 'course' });
  });

  it('points at the first section with its own issue, in outline order', () => {
    const sections = [section({ id: 'ok' }), section({ id: 'bad', title: '' })];
    expect(firstStudioIssue(thumb, sections)).toEqual({
      type: 'section',
      sectionId: 'bad',
    });
  });

  it('points at the first lesson with an issue inside a valid section', () => {
    const sections = [
      section({
        id: 's1',
        lessons: [video({ id: 'fine' }), video({ id: 'broken', title: '' })],
      }),
    ];
    expect(firstStudioIssue(thumb, sections)).toEqual({
      type: 'lesson',
      lessonId: 'broken',
      sectionId: 's1',
    });
  });

  it('returns null when nothing blocks publishing', () => {
    expect(firstStudioIssue(thumb, [section({ lessons: [video()] })])).toBeNull();
  });
});

describe('studioIssues', () => {
  it('lists each blocking item with where to fix it, in outline order', () => {
    const sections = [
      section({ id: 's1', title: '', lessons: [video({ id: 'l1', title: '' })] }),
    ];
    const issues = studioIssues({}, sections);

    expect(issues.map((i) => i.target)).toEqual([
      { type: 'course' },
      { type: 'section', sectionId: 's1' },
      { type: 'lesson', lessonId: 'l1', sectionId: 's1' },
    ]);
    expect(issues[0]?.label).toBe('Course thumbnail is missing');
  });

  it('asks for a first section when the outline is empty', () => {
    expect(studioIssues(thumb, []).map((i) => i.label)).toEqual([
      'Add at least one section',
    ]);
  });

  it('is empty when nothing blocks publishing', () => {
    expect(studioIssues(thumb, [section({ lessons: [video()] })])).toEqual([]);
  });
});
