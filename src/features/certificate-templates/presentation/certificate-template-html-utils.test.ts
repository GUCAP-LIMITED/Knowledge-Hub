import { describe, expect, it } from 'vitest';
import { escapeHtml } from './certificate-template-html-utils';

describe('escapeHtml', () => {
  it('escapes the characters that could break out of an HTML attribute or tag', () => {
    expect(escapeHtml(`<b>Tom & "Jerry"</b>`)).toBe(
      '&lt;b&gt;Tom &amp; &quot;Jerry&quot;&lt;/b&gt;',
    );
  });

  it('leaves plain text untouched', () => {
    expect(escapeHtml('for successfully completing {{courseName}}.')).toBe(
      'for successfully completing {{courseName}}.',
    );
  });
});
