import type { ReactElement } from 'react';
import { Search } from 'lucide-react';
import type { CertificateRoleSummary } from '../domain';
import { CertRolePills, type FilterSelection } from './CertRolePills';
import styles from './CertificatesPage.module.css';

export type { FilterSelection };

export interface CertificatesToolbarProps {
  readonly search: string;
  readonly onSearchChange: (value: string) => void;
  readonly selection: FilterSelection;
  readonly onSelect: (selection: FilterSelection) => void;
  readonly allCount: number;
  readonly myCount: number;
  readonly roles: readonly CertificateRoleSummary[];
  readonly showAll: boolean;
  readonly isAdmin: boolean;
}

/** Toolbar with role pills on the left and search input on the right. */
export const CertificatesToolbar = ({
  search,
  onSearchChange,
  selection,
  onSelect,
  allCount,
  myCount,
  roles,
  showAll,
  isAdmin,
}: CertificatesToolbarProps): ReactElement => (
  <div className={styles.toolbar}>
    <CertRolePills
      selection={selection}
      allCount={allCount}
      myCount={myCount}
      roles={roles}
      showAll={showAll}
      onSelect={onSelect}
    />

    <div className={styles.searchBox}>
      <Search size={16} className={styles.searchIcon} aria-hidden="true" />
      <input
        type="search"
        placeholder={
          isAdmin ? 'Search by title, recipient, or email…' : 'Search by course title…'
        }
        value={search}
        onChange={(e) => {
          onSearchChange(e.target.value);
        }}
        className={styles.searchInput}
      />
    </div>
  </div>
);
