import { useEffect } from 'react';

/** Locks background `<body>` scroll while `locked` is true, restoring the prior value on release. */
export const useBodyScrollLock = (locked: boolean): void => {
  useEffect(() => {
    if (!locked) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [locked]);
};
