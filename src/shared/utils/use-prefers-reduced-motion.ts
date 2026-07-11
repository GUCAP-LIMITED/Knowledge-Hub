import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/** Tracks the user's OS "reduce motion" preference, updating live if it changes. */
export const usePrefersReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState<boolean>(() =>
    typeof window === 'undefined' ? false : window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const onChange = (): void => {
      setReduced(media.matches);
    };
    media.addEventListener('change', onChange);
    return () => {
      media.removeEventListener('change', onChange);
    };
  }, []);

  return reduced;
};
