import { useState, type ReactElement } from 'react';
import { CONTENT_KINDS, KIND_META } from './content-types-model';
import { useCategoryAdmin } from './use-category-admin';
import { ContentTypeSummary } from './ContentTypeSummary';
import { TypesSearchBar, type KindFilter } from './TypesSearchBar';
import { ContentTypeManagerCard } from './ContentTypeManagerCard';
import { ContentTypesGuidance } from './ContentTypesGuidance';
import { ConfirmDeleteModal, type DeleteTarget } from './ConfirmDeleteModal';
import styles from './ContentTypesManager.module.css';

/** Admin editor for the per-kind content-category taxonomy (backend-backed) shown in Settings. */
export const ContentTypesManager = (): ReactElement => {
  const admin = useCategoryAdmin();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<KindFilter>('all');
  const [target, setTarget] = useState<DeleteTarget | null>(null);

  const visibleKinds = filter === 'all' ? CONTENT_KINDS : [filter];

  const handleConfirm = (confirmed: DeleteTarget): void => {
    admin.remove(confirmed.kind, confirmed.name);
    setTarget(null);
  };

  return (
    <div className={styles.manager}>
      <ContentTypeSummary types={admin.namesByKind} />
      <TypesSearchBar
        query={query}
        onQuery={setQuery}
        filter={filter}
        onFilter={setFilter}
      />
      <div className={styles.layout}>
        <div className={styles.mainCol}>
          {visibleKinds.map((kind) => (
            <ContentTypeManagerCard
              key={kind}
              kind={kind}
              meta={KIND_META[kind]}
              types={admin.namesByKind[kind]}
              query={query}
              onAdd={admin.add}
              onRequestRemove={(k, name) => {
                setTarget({ kind: k, name });
              }}
            />
          ))}
        </div>
        <div className={styles.sideCol}>
          <ContentTypesGuidance />
        </div>
      </div>

      <ConfirmDeleteModal
        target={target}
        onCancel={() => {
          setTarget(null);
        }}
        onConfirm={handleConfirm}
      />
    </div>
  );
};
