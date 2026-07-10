import { beforeEach, describe, expect, it } from 'vitest';
import { useContentTypesStore } from './content-types-store';

describe('content-types store', () => {
  beforeEach(() => {
    useContentTypesStore.setState({
      types: { course: ['Onboarding'], tutorial: [], resource: [] },
    });
  });

  it('adds a trimmed type', () => {
    useContentTypesStore.getState().addType('course', '  Compliance  ');
    expect(useContentTypesStore.getState().types.course).toContain('Compliance');
  });

  it('ignores blank and case-insensitive duplicate types', () => {
    const { addType } = useContentTypesStore.getState();
    addType('course', '   ');
    addType('course', 'onboarding');
    expect(useContentTypesStore.getState().types.course).toEqual(['Onboarding']);
  });

  it('removes a type', () => {
    useContentTypesStore.getState().removeType('course', 'Onboarding');
    expect(useContentTypesStore.getState().types.course).toEqual([]);
  });
});
