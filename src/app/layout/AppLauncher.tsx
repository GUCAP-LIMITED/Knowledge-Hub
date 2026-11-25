import {
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type ReactElement,
} from 'react';
import { LayoutGrid } from 'lucide-react';
import { Button, IconButton, Popover } from '@shared/ui';
import { useAuth, usePortalConfig, useSsoSecret } from '@features/auth';
import { useTheme } from '@app/theme/use-theme';
import { launcherAlignOffset } from './launcher-align-offset';
import styles from './AppLauncher.module.css';

const MESSAGE_SOURCE = 'uapp-launcher-iframe';
const DEFAULT_HEIGHT = 140;
// If the iframe reports nothing at all (not even an error) within this window, the SSO domain
// itself is unreachable — its JS never got a chance to run, so no postMessage is coming.
const RESPONSE_TIMEOUT_MS = 5000;

interface LauncherMessage {
  readonly source?: unknown;
  readonly type?: unknown;
  readonly height?: unknown;
  readonly url?: unknown;
}

interface MessageHandlers {
  readonly onResize: (height: number) => void;
  readonly onNavigate: (url: string) => void;
  readonly onReady: () => void;
  readonly onAuthError: () => void;
}

const handleLauncherMessage = (data: unknown, handlers: MessageHandlers): void => {
  if (typeof data !== 'object' || data === null) return;
  const message = data as LauncherMessage;
  if (message.source !== MESSAGE_SOURCE) return;

  if (message.type === 'launcher-resize' && typeof message.height === 'number') {
    handlers.onResize(message.height);
  } else if (message.type === 'launcher-navigate' && typeof message.url === 'string') {
    handlers.onNavigate(message.url);
  } else if (message.type === 'launcher-ready') {
    handlers.onReady();
  } else if (message.type === 'launcher-auth-error') {
    handlers.onAuthError();
  }
};

// Compared by hostname, not full origin: the configured SSO URL may be http:// while the server
// redirects the iframe to https://, which changes `event.origin` but not the host.
const safeHost = (url: string): string | null => {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
};

const buildLauncherUrl = (
  portal: { readonly loginUrl: string; readonly key: string },
  theme: string,
  ssoSecret: string | null,
): string =>
  `${portal.loginUrl.replace(/\/+$/, '')}/embed/widgets/app-launcher` +
  `?clientSecret=${encodeURIComponent(portal.key)}` +
  `&theme=${theme === 'dark' ? 'dark' : 'light'}` +
  // The widget can't read its own SSO-origin storage from a cross-origin iframe (storage
  // partitioning), so hand it the session secret explicitly.
  (ssoSecret !== null ? `&token=${encodeURIComponent(ssoSecret)}` : '');

type LauncherStatus = 'loading' | 'auth-error' | 'unresponsive';

const LauncherContent = ({
  status,
  launcherUrl,
  height,
  onSignIn,
}: {
  readonly status: LauncherStatus;
  readonly launcherUrl: string;
  readonly height: number;
  readonly onSignIn: () => void;
}): ReactElement => {
  if (status === 'auth-error') {
    return (
      <p className={styles.message}>
        Couldn&apos;t load your apps. Try reopening this menu, or{' '}
        <Button variant="link" onClick={onSignIn}>
          sign in
        </Button>
        .
      </p>
    );
  }
  if (status === 'unresponsive') {
    return (
      <p className={styles.message}>
        App launcher is unavailable right now. Please try again shortly.
      </p>
    );
  }
  return (
    <iframe
      src={launcherUrl}
      title="App launcher"
      className={styles.frame}
      style={{ height }}
    />
  );
};

/** Listens for the widget's `postMessage` events, accepting only messages from the SSO host. */
const useLauncherMessages = (
  ssoHost: string | null,
  timeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null>,
  setters: {
    readonly setHeight: (height: number) => void;
    readonly setHasAuthError: (value: boolean) => void;
  },
): void => {
  const { setHeight, setHasAuthError } = setters;
  useEffect(() => {
    const clearResponseTimeout = (): void => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
    const onMessage = (event: MessageEvent<unknown>): void => {
      if (ssoHost === null || safeHost(event.origin) !== ssoHost) return;
      handleLauncherMessage(event.data, {
        onResize: setHeight,
        onNavigate: (url) => {
          window.location.href = url;
        },
        onReady: clearResponseTimeout,
        onAuthError: () => {
          clearResponseTimeout();
          setHasAuthError(true);
        },
      });
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, [ssoHost, timeoutRef, setHeight, setHasAuthError]);
};

/**
 * Grid of the apps the signed-in user can access, served by the Uapp Portal SSO app as an embedded
 * widget (`/embed/widgets/app-launcher`). This component only builds the iframe URL and reacts to
 * its `postMessage` events — the widget owns its own UI, loading state and access-list caching.
 * See `Uapp-Authentication/docs/APP_LAUNCHER_INTEGRATION.md` for the full contract.
 */
export const AppLauncher = (): ReactElement | null => {
  const { isAuthenticated, beginSso } = useAuth();
  const portal = usePortalConfig();
  const ssoSecret = useSsoSecret();
  const { theme } = useTheme();

  const ssoHost = safeHost(portal.loginUrl);

  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [hasAuthError, setHasAuthError] = useState(false);
  const [unresponsive, setUnresponsive] = useState(false);
  const [alignOffset, setAlignOffset] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLauncherMessages(ssoHost, timeoutRef, { setHeight, setHasAuthError });

  // (Re)start the "SSO domain unreachable" timeout each time the popover opens.
  useEffect(() => {
    if (!open) return undefined;
    timeoutRef.current = setTimeout(() => {
      setUnresponsive(true);
    }, RESPONSE_TIMEOUT_MS);
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, [open]);

  if (portal.loginUrl.length === 0 || !isAuthenticated) {
    return null;
  }

  const launcherUrl = buildLauncherUrl(portal, theme, ssoSecret);
  const status: LauncherStatus = hasAuthError
    ? 'auth-error'
    : unresponsive
      ? 'unresponsive'
      : 'loading';

  return (
    <Popover
      align="end"
      contentClassName={styles.content}
      alignOffset={alignOffset}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        // A fresh load gets a fresh chance — don't carry a stale error/timeout into it.
        if (next) {
          setHasAuthError(false);
          setUnresponsive(false);
          // Re-measured on every open so a window resize in between is picked up.
          if (triggerRef.current !== null) {
            setAlignOffset(
              launcherAlignOffset(
                triggerRef.current.getBoundingClientRect().right,
                document.documentElement.clientWidth,
              ),
            );
          }
        }
      }}
      trigger={
        <IconButton ref={triggerRef} label="Open app launcher">
          <LayoutGrid size={16} />
        </IconButton>
      }
    >
      <LauncherContent
        status={status}
        launcherUrl={launcherUrl}
        height={height}
        onSignIn={beginSso}
      />
    </Popover>
  );
};
