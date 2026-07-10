import { useState, type FormEvent, type ReactElement } from 'react';
import { Button, IconButton, TextField } from '@shared/ui';
import { X } from 'lucide-react';
import type { ContentKind } from '../store/content-types-store';
import styles from './ContentTypesManager.module.css';

export interface ContentTypeGroupProps {
  readonly kind: ContentKind;
  readonly title: string;
  readonly hint: string;
  readonly types: readonly string[];
  readonly onAdd: (kind: ContentKind, name: string) => void;
  readonly onRemove: (kind: ContentKind, name: string) => void;
}

/** Editable list of type names for one catalog kind (course / tutorial / resource). */
export const ContentTypeGroup = ({
  kind,
  title,
  hint,
  types,
  onAdd,
  onRemove,
}: ContentTypeGroupProps): ReactElement => {
  const [draft, setDraft] = useState('');

  const submit = (event: FormEvent): void => {
    event.preventDefault();
    onAdd(kind, draft);
    setDraft('');
  };

  return (
    <section className={styles.group}>
      <header className={styles.groupHead}>
        <h3 className={styles.groupTitle}>{title}</h3>
        <p className={styles.groupHint}>{hint}</p>
      </header>

      <ul className={styles.chips}>
        {types.length === 0 ? (
          <li className={styles.empty}>No types yet — add one below.</li>
        ) : (
          types.map((type) => (
            <li key={type} className={styles.chip}>
              <span className={styles.chipLabel}>{type}</span>
              <IconButton
                label={`Remove ${type}`}
                variant="danger"
                className={styles.chipRemove}
                onClick={() => {
                  onRemove(kind, type);
                }}
              >
                <X size={14} aria-hidden />
              </IconButton>
            </li>
          ))
        )}
      </ul>

      <form className={styles.addRow} onSubmit={submit}>
        <TextField
          label={`New ${title.toLowerCase()} type`}
          placeholder="e.g. Onboarding"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
          }}
        />
        <Button type="submit" variant="accent" disabled={draft.trim() === ''}>
          Add type
        </Button>
      </form>
    </section>
  );
};
