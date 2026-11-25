import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { App } from './App';

describe('<App /> smoke test', () => {
  it('mounts the full app graph and shows the sign-in screen for an anonymous visitor', async () => {
    render(<App />);

    // Reaching the login button proves the composition root, providers, router and auth-restore
    // all initialised without throwing (a config/env crash here would white-screen the app).
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Sign in with UAPP' }),
      ).toBeInTheDocument();
    });
  });
});
