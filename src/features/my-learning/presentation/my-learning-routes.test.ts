import { describe, expect, it } from 'vitest';
import type { ContentTypeKey } from '../domain/types';
import { getLearningItemRoute } from './my-learning-routes';

describe('getLearningItemRoute', () => {
  it('resolves course route to /courses/:id', () => {
    const route = getLearningItemRoute({
      contentType: 'course',
      id: '3a23ff05-868c-5441-6fad-6295d54a7adb',
    });
    expect(route).toBe('/courses/3a23ff05-868c-5441-6fad-6295d54a7adb');
  });

  it('resolves tutorial route to /tutorials/:id', () => {
    const route = getLearningItemRoute({
      contentType: 'tutorial',
      id: '3a23ff05-868c-5441-6fad-6295d54a7adc',
    });
    expect(route).toBe('/tutorials/3a23ff05-868c-5441-6fad-6295d54a7adc');
  });

  it('resolves resource route to /resources/:id', () => {
    const route = getLearningItemRoute({
      contentType: 'resource',
      id: '3a23ff05-868c-5441-6fad-6295d54a7add',
    });
    expect(route).toBe('/resources/3a23ff05-868c-5441-6fad-6295d54a7add');
  });

  it('resolves course route using slug when available', () => {
    const route = getLearningItemRoute({
      contentType: 'course',
      id: '3a23ff05-868c-5441-6fad-6295d54a7adb',
      slug: 'react-fundamentals',
    });
    expect(route).toBe('/courses/react-fundamentals');
  });

  it('resolves tutorial route using slug when available', () => {
    const route = getLearningItemRoute({
      contentType: 'tutorial',
      id: '3a23ff05-868c-5441-6fad-6295d54a7adc',
      slug: 'intro-to-hooks',
    });
    expect(route).toBe('/tutorials/intro-to-hooks');
  });

  it('resolves resource route using slug when available', () => {
    const route = getLearningItemRoute({
      contentType: 'resource',
      id: '3a23ff05-868c-5441-6fad-6295d54a7add',
      slug: 'course-syllabus',
    });
    expect(route).toBe('/resources/course-syllabus');
  });

  it('falls back to course route for unrecognized type', () => {
    const route = getLearningItemRoute({
      contentType: 'unknown' as unknown as ContentTypeKey,
      id: 'custom-id',
    });
    expect(route).toBe('/courses/custom-id');
  });
});
