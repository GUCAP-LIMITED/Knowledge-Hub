import { Component, type ErrorInfo, type ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import type { Logger } from '@core/logger';
import { Alert, Button } from '@shared/ui';

export interface AppErrorBoundaryProps {
  readonly logger: Logger;
  readonly children: ReactNode;
}

interface AppErrorBoundaryState {
  readonly error: Error | null;
}

/**
 * Top-level safety net. React requires a class component for error boundaries. It catches render
 * errors anywhere below, logs them with context, and shows a recoverable fallback instead of a
 * blank screen.
 */
export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  public override state: AppErrorBoundaryState = { error: null };

  public static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  public override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.logger.error('Unhandled UI error', error, {
      componentStack: info.componentStack,
    });
    // Forward to Sentry too. A no-op when Sentry was never initialized (no DSN configured),
    // so the boundary keeps working in every environment.
    Sentry.captureException(error, {
      contexts: { react: { componentStack: info.componentStack ?? 'unknown' } },
    });
  }

  private readonly handleReload = (): void => {
    window.location.reload();
  };

  public override render(): ReactNode {
    const { error } = this.state;
    if (error === null) {
      return this.props.children;
    }

    return (
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          minHeight: '100vh',
          padding: '1.5rem',
        }}
      >
        <div style={{ maxWidth: 420, display: 'grid', gap: '1rem' }}>
          <Alert tone="error" title="Something went wrong">
            An unexpected error occurred. Reloading usually fixes it.
          </Alert>
          <Button onClick={this.handleReload}>Reload</Button>
        </div>
      </div>
    );
  }
}
