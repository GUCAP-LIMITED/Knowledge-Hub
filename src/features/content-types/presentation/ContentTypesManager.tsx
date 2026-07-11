import { useState, type ReactElement } from 'react';
import { useToast } from '@shared/ui';
import { useAuth } from '@features/auth';
import {
  CONTENT_KINDS,
  type ContentKind,
  useContentTypesStore,
} from '../store/content-types-store';
import { KIND_META, relativeTime } from './content-types-model';
import { ContentTypeSummary } from './ContentTypeSummary';
import { TypesSearchBar, type KindFilter } from './TypesSearchBar';
import { ContentTypeManagerCard } from './ContentTypeManagerCard';
import { ContentTypesGuidance } from './ContentTypesGuidance';
import { ContentTypesActivity } from './ContentTypesActivity';
import { ConfirmDeleteModal, type DeleteTarget } from './ConfirmDeleteModal';
import styles from './ContentTypesManager.module.css';

/** Admin editor for the per-kind content-type taxonomy shown in Settings. */
export const ContentTypesManager = (): ReactElement => {
  const types = useContentTypesStore((state) => state.types);
  const activity = useContentTypesStore((state) => state.activity);
  const addType = useContentTypesStore((state) => state.addType);
  const removeType = useContentTypesStore((state) => state.removeType);
  const { user } = useAuth();
  const actor = user?.fullName ?? 'Admin';
  const { push } = useToast();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<KindFilter>('all');
  const [target, setTarget] = useState<DeleteTarget | null>(null);

  const lastUpdated = activity[0] !== undefined ? relativeTime(activity[0].at) : '—';
  const visibleKinds = filter === 'all' ? CONTENT_KINDS : [filter];

  const handleAdd = (kind: ContentKind, name: string): void => {
    const result = addType(kind, name, actor);
    if (result === 'added') {
      push('success', `Added “${name.trim()}” to ${KIND_META[kind].label} types.`);
    } else if (result === 'duplicate') {
      push('error', `“${name.trim()}” already exists in ${KIND_META[kind].label} types.`);
    }
  };

  const handleConfirm = (confirmed: DeleteTarget): void => {
    removeType(confirmed.kind, confirmed.name, actor);
    setTarget(null);
    push(
      'info',
      `Removed “${confirmed.name}” from ${KIND_META[confirmed.kind].label} types.`,
    );
  };

  return (
    <div className={styles.manager}>
      <ContentTypeSummary types={types} lastUpdated={lastUpdated} />
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
              types={types[kind]}
              query={query}
              onAdd={handleAdd}
              onRequestRemove={(k, name) => {
                setTarget({ kind: k, name });
              }}
            />
          ))}
        </div>
        <div className={styles.sideCol}>
          <ContentTypesGuidance />
          <ContentTypesActivity activity={activity} />
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
