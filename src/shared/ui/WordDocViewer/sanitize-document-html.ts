/**
 * Structural tags mammoth's converter actually emits for a Word document — richer than the
 * `sanitizeRichText` allowlist (which only covers the small rich-text-editor vocabulary), since a
 * real .docx can contain headings, tables, and images.
 */
const ALLOWED_TAGS = new Set([
  'P',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'UL',
  'OL',
  'LI',
  'STRONG',
  'B',
  'EM',
  'I',
  'U',
  'A',
  'IMG',
  'TABLE',
  'THEAD',
  'TBODY',
  'TR',
  'TD',
  'TH',
  'BR',
  'SUP',
  'SUB',
  'BLOCKQUOTE',
  'SPAN',
  'DIV',
  'S',
  'MARK',
]);

/** Tags whose content is never meant to be displayed as text — drop them along with their content. */
const REMOVE_WITH_CONTENT = new Set(['SCRIPT', 'STYLE']);

const isSafeHref = (href: string): boolean => /^https?:\/\//i.test(href);
const isSafeImageSrc = (src: string): boolean => /^data:image\//i.test(src);

/** Strips every attribute, then restores only the specific ones a link/image needs to work. */
const sanitizeAttributes = (element: Element): void => {
  const href = element.getAttribute('href');
  const src = element.getAttribute('src');
  const alt = element.getAttribute('alt');
  Array.from(element.attributes).forEach((attribute) => {
    element.removeAttribute(attribute.name);
  });

  if (element.tagName === 'A' && href !== null && isSafeHref(href)) {
    element.setAttribute('href', href);
    element.setAttribute('target', '_blank');
    element.setAttribute('rel', 'noopener noreferrer');
  }
  if (element.tagName === 'IMG' && src !== null && isSafeImageSrc(src)) {
    element.setAttribute('src', src);
    if (alt !== null) element.setAttribute('alt', alt);
  }
};

const unwrap = (parent: ParentNode, element: Element): void => {
  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }
  parent.removeChild(element);
};

const sanitizeNode = (parent: ParentNode): void => {
  Array.from(parent.childNodes).forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) {
      parent.removeChild(child);
      return;
    }
    const element = child as Element;
    if (REMOVE_WITH_CONTENT.has(element.tagName)) {
      parent.removeChild(element);
      return;
    }
    sanitizeNode(element);
    if (!ALLOWED_TAGS.has(element.tagName)) {
      unwrap(parent, element);
      return;
    }
    sanitizeAttributes(element);
  });
};

/**
 * Strips a mammoth-generated HTML string down to a safe structural vocabulary (headings, lists,
 * tables, links, images) before it's ever passed to `dangerouslySetInnerHTML` — links are
 * restricted to `http(s)` and images to `data:image/` URIs (mammoth embeds images as data URIs),
 * so neither can carry a `javascript:`-style payload.
 */
export const sanitizeDocumentHtml = (html: string): string => {
  const template = document.createElement('template');
  template.innerHTML = html;
  sanitizeNode(template.content);
  return template.innerHTML;
};
