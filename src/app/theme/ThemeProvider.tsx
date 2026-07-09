import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { ThemeContext, type Theme } from './theme-context';

const STORAGE_KEY = 'uapp:theme';

/** System dark-mode preference, guarded for environments without `matchMedia` (e.g. jsdom). */
const prefersDark = (): boolean => {
  try {
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  } catch {
    return false; // matchMedia unavailable — fall back to light
  }
};

const initialTheme = (): Theme => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // storage unavailable (private mode) — fall through to the system preference
  }
  return prefersDark() ? 'dark' : 'light';
};

/** Owns the active colour theme, applies it to `<html data-theme>`, and persists the choice. */
export const ThemeProvider = ({
  children,
}: {
  readonly children: ReactNode;
}): ReactElement => {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore persistence failures
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
