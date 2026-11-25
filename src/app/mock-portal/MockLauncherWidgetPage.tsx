import { useEffect, useRef, type ReactElement } from 'react';
import styles from './MockPortal.module.css';

const MESSAGE_SOURCE = 'uapp-launcher-iframe';

const APPS = [
  { id: 'academy', name: 'Academy', initials: 'A', url: '/' },
  { id: 'hub', name: 'Comm Hub', initials: 'C', url: null },
  { id: 'leads', name: 'Leads', initials: 'L', url: null },
] as const;

const postToHost = (payload: Record<string, unknown>): void => {
  window.parent.postMessage({ source: MESSAGE_SOURCE, ...payload }, '*');
};

/** Stand-in for the portal's embeddable app-launcher widget (rendered inside an iframe). */
export const MockLauncherWidgetPage = (): ReactElement => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    postToHost({ type: 'launcher-ready' });
    const height = rootRef.current?.getBoundingClientRect().height;
    if (height !== undefined) {
      postToHost({ type: 'launcher-resize', height: Math.ceil(height) });
    }
  }, []);

  return (
    <div ref={rootRef} className={styles.launcher}>
      {APPS.map((app) => (
        <button
          key={app.id}
          type="button"
          className={styles.app}
          disabled={app.url === null}
          onClick={() => {
            if (app.url !== null) {
              postToHost({ type: 'launcher-navigate', url: app.url });
            }
          }}
        >
          <span className={styles.appIcon}>{app.initials}</span>
          {app.name}
        </button>
      ))}
    </div>
  );
};
