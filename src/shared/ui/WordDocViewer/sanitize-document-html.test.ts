import { describe, expect, it } from 'vitest';
import { sanitizeDocumentHtml } from './sanitize-document-html';

describe('sanitizeDocumentHtml', () => {
  it('keeps headings, lists, and table structure', () => {
    const html =
      '<h1>Title</h1><ul><li>one</li></ul><table><tr><td>cell</td></tr></table>';
    // The browser's HTML parser inserts an implicit <tbody> around bare <tr> children.
    expect(sanitizeDocumentHtml(html)).toBe(
      '<h1>Title</h1><ul><li>one</li></ul><table><tbody><tr><td>cell</td></tr></tbody></table>',
    );
  });

  it('strips a script tag entirely while keeping sibling text', () => {
    const result = sanitizeDocumentHtml('before<script>alert(1)</script>after');
    expect(result).not.toContain('<script>');
    expect(result).toContain('before');
    expect(result).toContain('after');
  });

  it('keeps a safe https link and adds target/rel', () => {
    const result = sanitizeDocumentHtml('<a href="https://example.com">link</a>');
    expect(result).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a>',
    );
  });

  it('strips a javascript: href but keeps the link text', () => {
    const result = sanitizeDocumentHtml('<a href="javascript:alert(1)">click me</a>');
    expect(result).not.toContain('javascript:');
    expect(result).toContain('click me');
  });

  it('keeps a data:image src on an img tag', () => {
    const html = '<img src="data:image/png;base64,AAAA" alt="pic">';
    expect(sanitizeDocumentHtml(html)).toBe(
      '<img src="data:image/png;base64,AAAA" alt="pic">',
    );
  });

  it('strips a non-data-uri img src', () => {
    const result = sanitizeDocumentHtml(
      '<img src="https://evil.example/x.png" alt="pic">',
    );
    expect(result).not.toContain('evil.example');
  });

  it('strips onerror and other attributes from an otherwise allowed tag', () => {
    const result = sanitizeDocumentHtml(
      '<p onclick="alert(1)" style="color:red">text</p>',
    );
    expect(result).toBe('<p>text</p>');
  });

  it('unwraps a disallowed tag but preserves its text content', () => {
    const result = sanitizeDocumentHtml(
      '<iframe src="https://evil.example">bad</iframe>',
    );
    expect(result).not.toContain('<iframe');
    expect(result).toBe('bad');
  });

  it('keeps strikethrough and highlight mark tags', () => {
    const html = '<p><s>struck</s> <mark>highlighted</mark></p>';
    expect(sanitizeDocumentHtml(html)).toBe(html);
  });
});
