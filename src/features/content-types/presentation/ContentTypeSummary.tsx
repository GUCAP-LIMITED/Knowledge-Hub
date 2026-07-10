import type { ReactElement } from 'react';
import { BookOpen, Clock, FolderOpen, Lightbulb, Tags } from 'lucide-react';
import { StatCard } from '@shared/ui';
import type { ContentKind } from '../store/content-types-store';
import styles from './ContentTypesManager.module.css';

export interface ContentTypeSummaryProps {
  readonly types: Record<ContentKind, readonly string[]>;
  readonly lastUpdated: string;
}

/** Enterprise summary row: totals per kind plus a last-updated indicator. */
export const ContentTypeSummary = ({
  types,
  lastUpdated,
}: ContentTypeSummaryProps): ReactElement => {
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
      <StatCard label="Last Updated" value={lastUpdated} icon={Clock} tone="warning" />
    </div>
  );
};
