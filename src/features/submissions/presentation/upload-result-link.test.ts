import { describe, expect, it } from 'vitest';
import { CONTENT_TYPE } from '@features/content';
import { uploadResultLink } from './upload-result-link';

describe('uploadResultLink', () => {
  it.each([
    [CONTENT_TYPE.course, 'View course', '/courses/abc', '/courses'],
    [CONTENT_TYPE.tutorial, 'View tutorial', '/tutorials/abc', '/tutorials'],
    [CONTENT_TYPE.resource, 'View resource', '/resources/abc', '/resources'],
  ])(
    'links published type %s to its catalog detail page',
    (type, label, to, guardPath) => {
      expect(uploadResultLink({ id: 'abc', type }, true)).toEqual({
        label,
        to,
        guardPath,
      });
    },
  );

  it('links content awaiting review to the author submission, whatever its type', () => {
    expect(uploadResultLink({ id: 'abc', type: CONTENT_TYPE.course }, false)).toEqual({
      label: 'View submission',
      to: '/submissions/abc/edit',
      guardPath: '/submissions',
    });
  });
});
