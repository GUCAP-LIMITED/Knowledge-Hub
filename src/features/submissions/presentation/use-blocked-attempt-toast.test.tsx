import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { ToastContext, type ToastApi } from '@shared/ui';
import { useBlockedAttemptToast } from './use-blocked-attempt-toast';

const Probe = ({
  attempt,
  missing,
}: {
  readonly attempt: number;
  readonly missing: readonly string[];
}): null => {
  useBlockedAttemptToast(attempt, missing);
  return null;
};

const makeApi = (): ToastApi => ({
  push: vi.fn(),
  success: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
});

const withToast = (api: ToastApi, node: ReactElement): ReactElement => (
  <ToastContext.Provider value={api}>{node}</ToastContext.Provider>
);

describe('useBlockedAttemptToast', () => {
  it('stays quiet until a blocked attempt happens', () => {
    const api = makeApi();
    render(withToast(api, <Probe attempt={0} missing={['Course thumbnail']} />));
    expect(api.error).not.toHaveBeenCalled();
  });

  it('toasts once per blocked attempt and names what is missing', () => {
    const api = makeApi();
    const { rerender } = render(
      withToast(api, <Probe attempt={1} missing={['Course thumbnail']} />),
    );
    expect(api.error).toHaveBeenCalledTimes(1);
    expect(api.error).toHaveBeenCalledWith(
      "Can't continue yet. Still needed: Course thumbnail.",
    );

    rerender(withToast(api, <Probe attempt={1} missing={['Course thumbnail']} />));
    expect(api.error).toHaveBeenCalledTimes(1);

    rerender(withToast(api, <Probe attempt={2} missing={['Course thumbnail']} />));
    expect(api.error).toHaveBeenCalledTimes(2);
  });

  it('caps the named items and counts the rest', () => {
    const api = makeApi();
    render(withToast(api, <Probe attempt={1} missing={['A', 'B', 'C', 'D', 'E']} />));
    expect(api.error).toHaveBeenCalledWith(
      "Can't continue yet. Still needed: A, B, C and 2 more.",
    );
  });

  it('works without a toast provider', () => {
    expect(() => render(<Probe attempt={1} missing={['A']} />)).not.toThrow();
  });
});
