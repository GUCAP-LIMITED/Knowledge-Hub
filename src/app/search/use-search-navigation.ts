import { useEffect, useState } from 'react';
import type { SearchContentTab } from '@features/search';
import type { Hit } from './search-overlay.types';

export interface UseSearchNavigationParams {
  readonly query: string;
  readonly activeTab: SearchContentTab;
  readonly flatHits: readonly Hit[];
  readonly onClose: () => void;
  readonly go: (to: string) => void;
}

/** Escape closes; Arrow keys move the active hit; Enter opens it. */
export const useSearchNavigation = (params: UseSearchNavigationParams): number => {
  const { query, activeTab, flatHits, onClose, go } = params;
  const [activeIndex, setActiveIndex] = useState(0);
  const total = flatHits.length;

  useEffect(() => {
    setActiveIndex(0);
  }, [query, activeTab]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (total === 0) {
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % total);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((index) => (index - 1 + total) % total);
      } else if (event.key === 'Enter') {
        const hit = flatHits[activeIndex];
        if (hit !== undefined) {
          go(hit.to);
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  });

  return activeIndex;
};
