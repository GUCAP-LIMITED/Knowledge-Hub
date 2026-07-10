import type { ReactElement } from 'react';
import { CONTENT_KINDS, useContentTypesStore } from '../store/content-types-store';
import { ContentTypeGroup } from './ContentTypeGroup';
import styles from './ContentTypesManager.module.css';

const GROUP_META: Record<
  (typeof CONTENT_KINDS)[number],
  { readonly title: string; readonly hint: string }
> = {
  course: {
    title: 'Course',
    hint: 'Types offered when uploading and filtering courses.',
  },
  tutorial: {
    title: 'Tutorial',
    hint: 'Types offered when uploading and filtering tutorials.',
  },
  resource: {
    title: 'Resource',
    hint: 'Types offered when uploading and filtering resources.',
  },
};

/** Admin editor for the per-kind content-type taxonomy shown in Settings. */
export const ContentTypesManager = (): ReactElement => {
  const types = useContentTypesStore((state) => state.types);
  const addType = useContentTypesStore((state) => state.addType);
  const removeType = useContentTypesStore((state) => state.removeType);

  return (
    <div className={styles.manager}>
      <p className={styles.lead}>
        Define the reusable types learners and admins pick from. Changes apply instantly
        across the upload wizard and catalog filters.
      </p>
      <div className={styles.groups}>
        {CONTENT_KINDS.map((kind) => (
          <ContentTypeGroup
            key={kind}
            kind={kind}
            title={GROUP_META[kind].title}
            hint={GROUP_META[kind].hint}
            types={types[kind]}
            onAdd={addType}
            onRemove={removeType}
          />
        ))}
      </div>
    </div>
  );
};
