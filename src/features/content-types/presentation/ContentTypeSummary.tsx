import type { ReactElement } from 'react';
import { BookOpen, FolderOpen, Lightbulb, Tags } from 'lucide-react';
import { StatCard } from '@shared/ui';
import type { ContentKind } from './content-types-model';
import styles from './ContentTypesManager.module.css';

export interface ContentTypeSummaryProps {
  readonly types: Record<ContentKind, readonly string[]>;
}

/** Summary row: total categories plus the per-kind counts. */
export const ContentTypeSummary = ({ types }: ContentTypeSummaryProps): ReactElement => {
  const total = types.course.length + types.tutorial.length + types.resource.length;
  return (
    <div className={styles.summary}>
      <StatCard label="Total Types" value={total} icon={Tags} tone="primary" />
      <StatCard
        label="Course Types"
        value={types.course.length}
        icon={BookOpen}
        tone="primary"
      />
      <StatCard
        label="Tutorial Types"
        value={types.tutorial.length}
        icon={Lightbulb}
        tone="secondary"
      />
      <StatCard
        label="Resource Types"
        value={types.resource.length}
        icon={FolderOpen}
        tone="success"
      />
    </div>
  );
};
