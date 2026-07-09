import { useContext } from 'react';
import { ThemeContext, type ThemeContextValue } from './theme-context';

/** Read the active theme and toggle it. Throws if used outside <ThemeProvider>. */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error('useTheme must be used within <ThemeProvider>.');
  }
  return context;
};
