import { describe, expect, it } from 'vitest';
import {
  isRichTextEmpty,
  sanitizeRichText,
  sanitizeSpreadsheetCellHtml,
} from './sanitize-rich-text';

describe('sanitizeRichText', () => {
  it('keeps allowed formatting tags', () => {
    const html = '<b>bold</b> <i>italic</i> <u>underline</u>';
    expect(sanitizeRichText(html)).toBe(html);
  });

  it('keeps list structure', () => {
    const html = '<ul><li>one</li><li>two</li></ul>';
    expect(sanitizeRichText(html)).toBe(html);
  });

  it('strips a script tag entirely while keeping sibling text', () => {
    const result = sanitizeRichText('before<script>alert(1)</script>after');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
    expect(result).toContain('before');
    expect(result).toContain('after');
  });

  it('unwraps a disallowed tag but preserves its text content', () => {
    const result = sanitizeRichText('<a href="javascript:alert(1)">click me</a>');
    expect(result).not.toContain('<a');
    expect(result).not.toContain('javascript:');
    expect(result).toBe('click me');
  });

  it('strips attributes from an otherwise allowed tag', () => {
    const result = sanitizeRichText('<b onclick="alert(1)" style="color:red">bold</b>');
    expect(result).toBe('<b>bold</b>');
  });

  it('sanitizes nested disallowed tags inside an allowed tag', () => {
    const result = sanitizeRichText('<b><img src=x onerror="alert(1)">bold</b>');
    expect(result).toBe('<b>bold</b>');
  });
});

describe('sanitizeSpreadsheetCellHtml', () => {
  it('keeps bold and strikethrough runs, dropping an empty style attribute', () => {
    const html = '<span style=""><b><s>bold strike</s></b></span>';
    expect(sanitizeSpreadsheetCellHtml(html)).toBe(
      '<span><b><s>bold strike</s></b></span>',
    );
  });

  it('keeps a safelisted font-size on span but drops other declarations', () => {
    const html = '<span style="font-size:20pt;color:red;">big</span>';
    expect(sanitizeSpreadsheetCellHtml(html)).toBe(
      '<span style="font-size:20pt">big</span>',
    );
  });

  it('drops a style attribute on a non-span tag', () => {
    const html = '<b style="color:red">bold</b>';
    expect(sanitizeSpreadsheetCellHtml(html)).toBe('<b>bold</b>');
  });

  it('strips a script tag entirely while keeping sibling text', () => {
    const result = sanitizeSpreadsheetCellHtml('before<script>alert(1)</script>after');
    expect(result).not.toContain('<script>');
    expect(result).toContain('before');
    expect(result).toContain('after');
  });

  it('unwraps a disallowed tag but preserves its text content', () => {
    const result = sanitizeSpreadsheetCellHtml('<a href="javascript:alert(1)">click</a>');
    expect(result).not.toContain('<a');
    expect(result).toBe('click');
  });
});

describe('isRichTextEmpty', () => {
  it('treats an empty string as empty', () => {
    expect(isRichTextEmpty('')).toBe(true);
  });

  it('treats a stray line break left by a cleared contentEditable as empty', () => {
    expect(isRichTextEmpty('<div><br></div>')).toBe(true);
  });

  it('treats whitespace-only content as empty', () => {
    expect(isRichTextEmpty('<p>   </p>')).toBe(true);
  });

  it('treats real text content as non-empty', () => {
    expect(isRichTextEmpty('<p>hello</p>')).toBe(false);
  });
});
