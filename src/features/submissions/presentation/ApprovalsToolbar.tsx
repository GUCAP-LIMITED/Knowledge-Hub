import type { ReactElement } from 'react';
import { FilterBar, Select, TextField } from '@shared/ui';
import { ApprovalsActiveFilterChips } from './components/ApprovalsActiveFilterChips';
import styles from './ApprovalsPage.module.css';

export interface ApprovalsToolbarProps {
  readonly query: string;
  readonly type: string;
  readonly types: readonly string[];
  readonly onQuery: (value: string) => void;
  readonly onType: (value: string) => void;
  readonly onClearAll: () => void;
}

/** Search + content-type filter for the approval queue. */
export const ApprovalsToolbar = ({
  query,
  type,
  types,
  onQuery,
  onType,
  onClearAll,
}: ApprovalsToolbarProps): ReactElement => (
  <div className={styles.toolbarContainer}>
    <div className={styles.toolbar}>
      <FilterBar
        search={
          <TextField
            label="Search"
            placeholder="Search title or submitter…"
            value={query}
            onChange={(event) => {
              onQuery(event.target.value);
            }}
            onClear={() => {
              onQuery('');
            }}
          />
        }
        controls={
          <Select
            label="Content type"
            value={type}
            onChange={onType}
            options={[
              { value: 'all', label: 'All types' },
              ...types.map((t) => ({ value: t, label: t })),
            ]}
          />
        }
      />
    </div>

    <ApprovalsActiveFilterChips
      query={query}
      onQueryChange={onQuery}
      type={type}
      onTypeChange={onType}
      onClearAll={onClearAll}
    />
  </div>
);
