import { useState, type FormEvent, type ReactElement } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@shared/ui';
import styles from './ContentTypesManager.module.css';

export interface AddTypeRowProps {
  readonly label: string;
  readonly existing: readonly string[];
  readonly onAdd: (name: string) => void;
}

/** Compact add-a-type control: teal primary action, Enter support, and inline duplicate guard. */
export const AddTypeRow = ({ label, existing, onAdd }: AddTypeRowProps): ReactElement => {
  const [draft, setDraft] = useState('');
  const trimmed = draft.trim();
  const duplicate =
    trimmed !== '' && existing.some((t) => t.toLowerCase() === trimmed.toLowerCase());
  const canAdd = trimmed !== '' && !duplicate;

  const submit = (event: FormEvent): void => {
    event.preventDefault();
    if (!canAdd) {
      return;
    }
    onAdd(trimmed);
    setDraft('');
  };

  return (
    <form className={styles.addForm} onSubmit={submit}>
      <div className={styles.addRow}>
        <input
          className={styles.addInput}
          value={draft}
          placeholder={`Add ${label.toLowerCase()} type…`}
          aria-label={`New ${label.toLowerCase()} type`}
          aria-invalid={duplicate}
          onChange={(event) => {
            setDraft(event.target.value);
          }}
        />
        <Button type="submit" size="sm" disabled={!canAdd}>
          <Plus size={15} aria-hidden="true" /> Add
        </Button>
      </div>
      {duplicate ? (
        <span className={styles.addError} role="status">
          “{trimmed}” already exists.
        </span>
      ) : null}
    </form>
  );
};
