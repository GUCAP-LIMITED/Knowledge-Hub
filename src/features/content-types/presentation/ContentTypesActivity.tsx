import type { ReactElement } from 'react';
import { History, Minus, Plus } from 'lucide-react';
import { cn } from '@shared/utils';
import type { ActivityEntry } from '../store/content-types-store';
import { KIND_META, relativeTime } from './content-types-model';
import styles from './ContentTypesManager.module.css';

export interface ContentTypesActivityProps {
  readonly activity: readonly ActivityEntry[];
}

/** Compact audit trail: who changed which type, and when — accountability for admins. */
export const ContentTypesActivity = ({
  activity,
}: ContentTypesActivityProps): ReactElement => {
  const recent = activity.slice(0, 6);
  return (
    <aside className={styles.panel} aria-label="Recent activity">
      <div className={styles.panelHead}>
        <History size={16} strokeWidth={1.75} aria-hidden="true" />
        <h3 className={styles.panelTitle}>Recent activity</h3>
      </div>
      {recent.length === 0 ? (
        <p className={styles.panelEmpty}>
          No changes yet. Added and removed types show here.
        </p>
      ) : (
        <ul className={styles.activityList}>
          {recent.map((item) => (
            <li key={item.id} className={styles.activityItem}>
              <span
                className={cn(
                  styles.activityIcon,
                  item.action === 'added' ? styles.activityAdd : styles.activityRemove,
                )}
              >
                {item.action === 'added' ? (
                  <Plus size={12} aria-hidden="true" />
                ) : (
                  <Minus size={12} aria-hidden="true" />
                )}
              </span>
              <span className={styles.activityText}>
                <span className={styles.activityName}>
                  {item.action === 'added' ? 'Added' : 'Removed'} “{item.name}”
                </span>
                <span className={styles.activityMeta}>
                  {KIND_META[item.kind].label} · {item.actor} · {relativeTime(item.at)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};
