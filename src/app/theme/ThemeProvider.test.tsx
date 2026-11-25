import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactElement } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './use-theme';

const Probe = (): ReactElement => {
  const { theme, toggle } = useTheme();
  return (
    <button type="button" onClick={toggle}>
      {theme}
    </button>
  );
};

type ChangeListener = (event: MediaQueryListEvent) => void;

const stubSystemPreference = (
  dark: boolean,
): { readonly emit: (matches: boolean) => void } => {
  const listeners = new Set<ChangeListener>();
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation(() => ({
      matches: dark,
      addEventListener: (_type: string, cb: ChangeListener) => listeners.add(cb),
      removeEventListener: (_type: string, cb: ChangeListener) => listeners.delete(cb),
    })),
  );
  return {
    emit: (matches: boolean): void => {
      listeners.forEach((cb) => {
        cb({ matches } as MediaQueryListEvent);
      });
    },
  };
};

const renderProvider = (): void => {
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses the stored choice over the system preference', () => {
    stubSystemPreference(true);
    localStorage.setItem('uapp:theme', 'light');
    renderProvider();

    expect(screen.getByRole('button')).toHaveTextContent('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('falls back to the system preference and does not persist it', () => {
    stubSystemPreference(true);
    renderProvider();

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('uapp:theme')).toBeNull();
  });

  it('persists only an explicit toggle', async () => {
    stubSystemPreference(false);
    renderProvider();

    await userEvent.click(screen.getByRole('button'));

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('uapp:theme')).toBe('dark');
  });

  it('follows live system changes until the user has chosen', () => {
    const system = stubSystemPreference(false);
    renderProvider();

    act(() => {
      system.emit(true);
    });
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('ignores system changes once a choice is stored', () => {
    const system = stubSystemPreference(false);
    localStorage.setItem('uapp:theme', 'light');
    renderProvider();

    act(() => {
      system.emit(true);
    });
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('ignores an invalid stored value', () => {
    stubSystemPreference(false);
    localStorage.setItem('uapp:theme', 'purple');
    renderProvider();

    expect(document.documentElement.dataset.theme).toBe('light');
  });
});
