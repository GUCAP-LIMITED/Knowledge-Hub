import type { ReactElement } from 'react';
import { cn } from '@shared/utils';
import type { Certificate } from '../domain';
import styles from './CertificatesPage.module.css';

export interface CertCategoryPillsProps {
  readonly certificates: readonly Certificate[];
  readonly active: string;
  readonly onSelect: (value: string) => void;
}

/** Category filter pills with per-category counts. */
export const CertCategoryPills = ({
  certificates,
  active,
  onSelect,
}: CertCategoryPillsProps): ReactElement => {
  const categories = [...new Set(certificates.map((cert) => cert.category))];
  const countFor = (name: string): number =>
    certificates.filter((cert) => cert.category === name).length;

  return (
    <div className={styles.pills}>
      <button
        type="button"
        className={cn(styles.pill, active === 'all' && styles.pillActive)}
        onClick={() => {
          onSelect('all');
        }}
      >
        All ({certificates.length})
      </button>
      {categories.map((name) => (
        <button
          key={name}
          type="button"
          className={cn(styles.pill, active === name && styles.pillActive)}
          onClick={() => {
            onSelect(name);
          }}
        >
          {name} ({countFor(name)})
        </button>
      ))}
    </div>
  );
};
