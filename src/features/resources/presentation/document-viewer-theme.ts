/**
 * Theme handed to the embedded document viewer. The values are CSS variables defined in
 * `global.css` (`--doc-viewer-*`): the original light literals in light mode, theme tokens in dark.
 * The rendered PDF/Office pages themselves stay white, as the document author intended.
 */
export const DOCUMENT_VIEWER_THEME = {
  primary: 'var(--doc-viewer-primary)',
  secondary: 'var(--doc-viewer-secondary)',
  tertiary: 'var(--doc-viewer-tertiary)',
  textPrimary: 'var(--doc-viewer-text-primary)',
  textSecondary: 'var(--doc-viewer-text-secondary)',
  textTertiary: 'var(--doc-viewer-text-tertiary)',
  disableThemeScrollbar: false,
} as const;

export const DOCUMENT_VIEWER_BACKGROUND = 'var(--doc-viewer-bg)';
