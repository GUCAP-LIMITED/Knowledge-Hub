import type { ReactElement } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@shared/ui';
import styles from './SearchOverlay.module.css';

export interface SearchInputRowProps {
  readonly query: string;
  readonly onChangeQuery: (value: string) => void;
  readonly onClose: () => void;
  readonly placeholder?: string;
}

export const SearchInputRow = ({
  query,
  onChangeQuery,
  onClose,
  placeholder = 'Search courses, tutorials, resources…',
}: SearchInputRowProps): ReactElement => (
  <div className={styles.searchRow}>
    <Search size={20} aria-hidden="true" className={styles.searchIcon} />
    <input
      className={styles.input}
      placeholder={placeholder}
      value={query}
      onChange={(event) => {
        onChangeQuery(event.target.value);
      }}
      aria-label="Search"
      autoFocus
    />
    <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close search">
      <X aria-hidden="true" />
    </Button>
  </div>
);
