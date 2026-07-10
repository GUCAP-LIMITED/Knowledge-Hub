import type { ReactElement } from 'react';
import { Info } from 'lucide-react';
import styles from './ContentTypesManager.module.css';

const POINTS: readonly string[] = [
  'Content types appear in the upload wizard when publishing.',
  'They let learners and admins filter the catalog.',
  'Changes apply instantly across courses, tutorials and resources.',
  'Avoid duplicate or overly specific labels.',
];

/** Subtle policy panel explaining how the taxonomy is used — turns empty space into guidance. */
export const ContentTypesGuidance = (): ReactElement => (
  <aside className={styles.panel} aria-label="How content types are used">
    <div className={styles.panelHead}>
      <Info size={16} strokeWidth={1.75} aria-hidden="true" />
      <h3 className={styles.panelTitle}>How content types are used</h3>
    </div>
    <ul className={styles.guidanceList}>
      {POINTS.map((point) => (
        <li key={point} className={styles.guidanceItem}>
          {point}
        </li>
      ))}
    </ul>
  </aside>
);
