import { theme as antdTheme } from 'antd';

/**
 * UAPP Academy brand palette. Mirrors the token/`c` object used across
 * KnowledgeHub.jsx so the new Ant Design creation flow reads as native to the
 * product rather than "default AntD blue".
 */
export const brand = {
  primary: '#045D5E',
  primaryDark: '#0a9396',
  secondary: '#FC7300',
  secondaryDark: '#e56700',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
};

/**
 * Content-type accent colours. Each creation "track" gets its own accent so the
 * user always has a peripheral cue for what they're building (colour = identity,
 * reduces mode-confusion — a course never looks like a resource).
 */
export const typeAccent = {
  course: { color: '#045D5E', soft: 'rgba(4,93,94,0.10)', softDark: 'rgba(10,147,150,0.18)' },
  tutorial: { color: '#FC7300', soft: 'rgba(252,115,0,0.10)', softDark: 'rgba(252,115,0,0.18)' },
  resource: { color: '#3b82f6', soft: 'rgba(59,130,246,0.10)', softDark: 'rgba(59,130,246,0.18)' },
};

/**
 * Build an Ant Design ConfigProvider theme for light/dark. We drive AntD's
 * algorithm (default vs dark) and override the seed tokens with UAPP brand
 * values so every AntD widget — Steps, Upload, Form, Buttons — inherits the
 * palette automatically.
 */
export function makeAntdTheme(isDark) {
  return {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: isDark ? brand.primaryDark : brand.primary,
      colorInfo: brand.info,
      colorSuccess: brand.success,
      colorWarning: brand.warning,
      colorError: brand.danger,
      colorLink: isDark ? brand.primaryDark : brand.primary,
      borderRadius: 10,
      borderRadiusLG: 14,
      wireframe: false,
      fontFamily:
        "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSize: 14,
      colorBgLayout: isDark ? '#0b1220' : '#F1F4F3',
      colorBgContainer: isDark ? '#1e293b' : '#FFFFFF',
      colorBorder: isDark ? '#334155' : '#e2e8f0',
      colorBorderSecondary: isDark ? '#293548' : '#eef2f1',
      colorText: isDark ? '#f1f5f9' : '#0f172a',
      colorTextSecondary: isDark ? '#cbd5e1' : '#475569',
      colorTextTertiary: isDark ? '#94a3b8' : '#64748b',
      boxShadow:
        '0 4px 6px -1px rgba(15,23,42,0.07), 0 2px 4px -2px rgba(15,23,42,0.05)',
      boxShadowSecondary:
        '0 10px 15px -3px rgba(15,23,42,0.08), 0 4px 6px -4px rgba(15,23,42,0.05)',
    },
    components: {
      Steps: {
        fontSize: 14,
        iconSize: 30,
        titleLineHeight: 22,
      },
      Card: {
        paddingLG: 24,
        boxShadowTertiary: isDark
          ? '0 1px 2px rgba(0,0,0,0.3)'
          : '0 1px 2px rgba(15,23,42,0.04)',
      },
      Button: {
        controlHeight: 38,
        controlHeightLG: 44,
        fontWeight: 600,
        primaryShadow: 'none',
        defaultShadow: 'none',
      },
      Segmented: {
        itemSelectedBg: isDark ? brand.primaryDark : brand.primary,
        itemSelectedColor: '#ffffff',
      },
      Input: { controlHeight: 40, paddingBlock: 8 },
      Select: { controlHeight: 40 },
    },
  };
}

/**
 * Surface tokens for hand-styled shells (the custom layout chrome that wraps the
 * AntD widgets). Kept in sync with the KnowledgeHub `c` palette.
 */
export function surfaceTokens(isDark) {
  return {
    bg: isDark ? '#0b1220' : '#F1F4F3',
    bgSubtle: isDark ? '#0f172a' : '#e9edec',
    surface: isDark ? '#1e293b' : '#FFFFFF',
    surfaceAlt: isDark ? '#172033' : '#f8fafc',
    border: isDark ? '#334155' : '#e2e8f0',
    text: isDark ? '#f1f5f9' : '#0f172a',
    textMuted: isDark ? '#cbd5e1' : '#475569',
    textSubtle: isDark ? '#94a3b8' : '#64748b',
    shadowLg: isDark
      ? '0 10px 30px -10px rgba(0,0,0,0.6)'
      : '0 10px 30px -12px rgba(15,23,42,0.18)',
  };
}
