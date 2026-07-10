import type { ReactElement } from 'react';
import type { ContentKind } from '../store/content-types-store';
import type { KindMeta } from './content-types-model';
import { TypeChip } from './TypeChip';
import { AddTypeRow } from './AddTypeRow';
import styles from './ContentTypesManager.module.css';

const ChipArea = ({
  types,
  visible,
  query,
  onRemove,
}: {
  readonly types: readonly string[];
  readonly visible: readonly string[];
  readonly query: string;
  readonly onRemove: (name: string) => void;
}): ReactElement => {
  if (types.length === 0) {
    return <p className={styles.cardEmpty}>No types yet — add the first one below.</p>;
  }
  if (visible.length === 0) {
    return <p className={styles.cardEmpty}>No types match “{query.trim()}”.</p>;
  }
  return (
    <div className={styles.chips}>
      {visible.map((type) => (
        <TypeChip
          key={type}
          label={type}
          onRemove={() => {
            onRemove(type);
          }}
        />
      ))}
    </div>
  );
};

export interface ContentTypeManagerCardProps {
  readonly kind: ContentKind;
  readonly meta: KindMeta;
  readonly types: readonly string[];
  readonly query: string;
  readonly onAdd: (kind: ContentKind, name: string) => void;
  readonly onRequestRemove: (kind: ContentKind, name: string) => void;
}

/** One catalog kind's card: header, count, filterable chips, and a compact add control. */
export const ContentTypeManagerCard = ({
  kind,
  meta,
  types,
  query,
  onAdd,
  onRequestRemove,
}: ContentTypeManagerCardProps): ReactElement => {
  const Icon = meta.icon;
  const needle = query.trim().toLowerCase();
  const visible =
    needle === '' ? types : types.filter((t) => t.toLowerCase().includes(needle));

  return (
    <section className={styles.card} aria-label={`${meta.label} types`}>
      <header className={styles.cardHead}>
        <span className={styles.cardIcon}>
          <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className={styles.cardHeadText}>
          <h3 className={styles.cardTitle}>{meta.label}</h3>
          <p className={styles.cardDesc}>{meta.description}</p>
        </div>
        <span className={styles.cardCount}>
          {needle === ''
            ? `${String(types.length)} types`
            : `${String(visible.length)} of ${String(types.length)}`}
        </span>
      </header>

      <ChipArea
        types={types}
        visible={visible}
        query={query}
        onRemove={(name) => {
          onRequestRemove(kind, name);
        }}
      />

      <AddTypeRow
        label={meta.label}
        existing={types}
        onAdd={(name) => {
          onAdd(kind, name);
        }}
      />
    </section>
  );
};
