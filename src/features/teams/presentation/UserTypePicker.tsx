import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { Alert, Spinner } from '@shared/ui';
import type { SelectableUserType } from '../domain';
import styles from './TeamsPage.module.css';

export interface UserTypePickerProps {
  readonly query: UseQueryResult<readonly SelectableUserType[]>;
  readonly selectedIds: ReadonlySet<string>;
  readonly onToggle: (id: string) => void;
}

/** A checkbox list of the tenant's user types — the team-member multi-select. */
export const UserTypePicker = ({
  query,
  selectedIds,
  onToggle,
}: UserTypePickerProps): ReactElement => {
  if (query.isPending) {
    return <Spinner size="sm" label="Loading user types" />;
  }
  if (query.isError) {
    return <Alert tone="error">Could not load user types.</Alert>;
  }

  const options = query.data;
  return (
    <fieldset className={styles.picker}>
      <legend className={styles.pickerLabel}>Member user types</legend>
      {options.length === 0 ? (
        <span className={styles.muted}>No user types available.</span>
      ) : null}
      {options.map((option) => (
        <label key={option.id} className={styles.pickerOption}>
          <input
            type="checkbox"
            checked={selectedIds.has(option.id)}
            onChange={() => {
              onToggle(option.id);
            }}
          />
          <span>{option.name}</span>
        </label>
      ))}
    </fieldset>
  );
};
