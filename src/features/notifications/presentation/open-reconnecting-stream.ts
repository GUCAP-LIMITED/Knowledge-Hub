/** Delay before re-opening a stream the browser has given up on. */
const RECONNECT_DELAY_MS = 5000;

/**
 * Opens an `EventSource` and keeps it alive. The browser retries by itself while the connection is
 * merely dropped (it reuses the original URL), but once it gives up (`CLOSED`, e.g. a 401 because
 * the token baked into that URL expired) we open a fresh stream with a freshly built URL.
 * Returns a disposer that stops reconnecting and closes the current stream.
 */
export const openReconnectingStream = (
  buildUrl: () => string,
  attach: (source: EventSource) => void,
): (() => void) => {
  let source: EventSource | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;

  const connect = (): void => {
    const next = new EventSource(buildUrl(), { withCredentials: true });
    source = next;
    attach(next);
    next.onerror = (): void => {
      if (disposed || next.readyState !== EventSource.CLOSED) {
        return;
      }
      timer = setTimeout(connect, RECONNECT_DELAY_MS);
    };
  };

  connect();

  return (): void => {
    disposed = true;
    if (timer !== null) {
      clearTimeout(timer);
    }
    source?.close();
  };
};
