import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { ThemeContext, type Theme } from './theme-context';

const STORAGE_KEY = 'uapp:theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

const isTheme = (value: string | null): value is Theme =>
  value === 'light' || value === 'dark';

/** System dark-mode preference, guarded for environments without `matchMedia` (e.g. jsdom). */
const prefersDark = (): boolean => {
  try {
    return (
      typeof window.matchMedia === 'function' && window.matchMedia(DARK_QUERY).matches
    );
  } catch {
    return false; // matchMedia unavailable — fall back to light
  }
};

/** The user's explicit choice, or null when they have never toggled (follow the system). */
const readStoredTheme = (): Theme | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    return null; // storage unavailable (private mode)
  }
};

const persistTheme = (theme: Theme): void => {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore persistence failures
  }
};

/**
 * Owns the active colour theme and applies it to `<html data-theme>`.
 *
 * Resolution order: the user's stored choice, else the system preference. Only an explicit toggle
 * is persisted, so a user who never toggled keeps following the OS (including live changes),
 * while a stored choice always wins. The blocking script in `index.html` applies the same order
 * before first paint, so this provider normally just confirms what is already on `<html>`.
 */
export const ThemeProvider = ({
  children,
}: {
  readonly children: ReactNode;
}): ReactElement => {
  const [theme, setTheme] = useState<Theme>(
    () => readStoredTheme() ?? (prefersDark() ? 'dark' : 'light'),
  );

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Follow live OS changes until the user makes an explicit choice.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const media = window.matchMedia(DARK_QUERY);
    const onChange = (event: MediaQueryListEvent): void => {
      if (readStoredTheme() === null) {
        setTheme(event.matches ? 'dark' : 'light');
      }
    };
    media.addEventListener('change', onChange);
    return () => {
      media.removeEventListener('change', onChange);
    };
  }, []);

  // Keep other open tabs in sync when the choice changes elsewhere.
  useEffect(() => {
    const onStorage = (event: StorageEvent): void => {
      if (event.key === STORAGE_KEY && isTheme(event.newValue)) {
        setTheme(event.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    persistTheme(next);
    setTheme(next);
  }, [theme]);

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
