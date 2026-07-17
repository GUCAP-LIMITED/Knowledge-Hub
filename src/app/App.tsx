import { useMemo, type ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'motion/react';
import { TooltipProvider, ToastProvider } from '@shared/ui';
import { AppErrorBoundary } from '@app/AppErrorBoundary';
import { ToastErrorBridge } from '@app/ToastErrorBridge';
import { FeatureProviders } from '@app/FeatureProviders';
import { AppRouter } from '@app/router/AppRouter';
import { createComposition } from '@app/di/composition-root';
import { ThemeProvider } from '@app/theme/ThemeProvider';

/**
 * Root component. Builds the dependency graph once, then mounts the provider/router tree. All
 * cross-cutting providers belong here so the rest of the app stays unaware of wiring.
 */
export const App = (): ReactElement => {
  const composition = useMemo(
    () =>
      createComposition({
        env: import.meta.env,
        storage: window.localStorage,
      }),
    [],
  );

  return (
    <AppErrorBoundary logger={composition.logger}>
      <ThemeProvider>
        <QueryClientProvider client={composition.queryClient}>
          <MotionConfig reducedMotion="user">
            <TooltipProvider>
              <ToastProvider>
                <ToastErrorBridge notifier={composition.errorNotifier} />
                <FeatureProviders composition={composition}>
                  <BrowserRouter
                    future={{
                      v7_startTransition: true,
                      v7_relativeSplatPath: true,
                    }}
                  >
                    <AppRouter />
                  </BrowserRouter>
                </FeatureProviders>
              </ToastProvider>
            </TooltipProvider>
          </MotionConfig>
        </QueryClientProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
};
