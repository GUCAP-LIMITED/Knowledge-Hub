import type { ReactElement } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@shared/utils';
import type { WidgetCatalogItem } from '../../domain';
import { KIND_ICON_MAP, KIND_LABELS } from './catalog-constants';
import styles from './AddWidgetModal.module.css';

export interface CatalogStepProps {
  readonly grouped: Map<string, WidgetCatalogItem[]>;
  readonly activeKeys: readonly string[];
  readonly onSelect: (item: WidgetCatalogItem) => void;
  readonly onRemove: (key: string) => void;
}

export const CatalogStepView = ({
  grouped,
  activeKeys,
  onSelect,
  onRemove,
}: CatalogStepProps): ReactElement => (
  <>
    {Array.from(grouped.entries()).map(([category, items]) => (
      <div key={category} className={styles.categoryGroup}>
        <span className={styles.categoryTitle}>{category}</span>
        <div className={styles.cardGrid}>
          {items.map((item) => {
            const isAdded = activeKeys.includes(item.key);
            const Icon = KIND_ICON_MAP[item.kind];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  if (isAdded) {
                    onRemove(item.key);
                  } else {
                    onSelect(item);
                  }
                }}
                className={cn(styles.catalogCard, isAdded && styles.catalogCardAdded)}
              >
                {isAdded ? (
                  <div className={styles.checkBadge}>
                    <Check size={11} aria-hidden="true" />
                  </div>
                ) : null}
                <div className={styles.iconWrapper}>
                  <Icon size={18} aria-hidden="true" />
                </div>
                <span className={styles.cardName}>{item.displayName}</span>
                <span className={styles.cardKind}>{KIND_LABELS[item.kind]}</span>
              </button>
            );
          })}
        </div>
      </div>
    ))}
  </>
);
