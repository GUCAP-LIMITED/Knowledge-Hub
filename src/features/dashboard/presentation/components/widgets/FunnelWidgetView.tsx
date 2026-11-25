import type { ReactElement } from 'react';
import type { WidgetData } from '../../../domain';
import styles from './WidgetViews.module.css';

const numberFormatter = new Intl.NumberFormat();

export const FunnelWidgetView = ({
  data,
}: {
  readonly data: WidgetData;
}): ReactElement => {
  const stages = data.series;
  if (stages.length === 0) {
    return <div className={styles.emptyState}>No funnel stages recorded</div>;
  }

  const baseline = Math.max(stages[0]?.value ?? 1, 1);

  return (
    <div className={styles.funnelContainer}>
      {stages.map((stage) => {
        const pct = Math.max(Math.min((stage.value / baseline) * 100, 100), 4);
        return (
          <div key={stage.label} className={styles.funnelStage}>
            <div className={styles.funnelStageHeader}>
              <span>{stage.label}</span>
              <strong>{numberFormatter.format(stage.value)}</strong>
            </div>
            <div className={styles.funnelTrack}>
              <div className={styles.funnelBar} style={{ width: `${String(pct)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
