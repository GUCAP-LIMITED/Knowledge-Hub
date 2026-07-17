import type { ReactElement } from 'react';
import { Badge, Spinner } from '@shared/ui';
import type { DashboardPeriod, WidgetData, WidgetInstance } from '../domain';
import { useWidgetData } from './use-dashboard';
import styles from './DashboardPage.module.css';

const numberFormat = new Intl.NumberFormat();

const TileBody = ({ data }: { readonly data: WidgetData }): ReactElement => {
  if (data.kind === 'kpi') {
    return (
      <>
        <span className={styles.kpi}>
          {data.value !== null ? numberFormat.format(data.value) : (data.summary ?? '—')}
        </span>
        {data.delta !== null ? (
          <span className={styles.delta}>
            {data.delta >= 0 ? '+' : ''}
            {numberFormat.format(data.delta)} vs previous
          </span>
        ) : null}
      </>
    );
  }

  if (data.series.length === 0) {
    return <span className={styles.muted}>No data</span>;
  }

  return (
    <ul className={styles.series}>
      {data.series.slice(0, 6).map((point) => (
        <li key={point.label} className={styles.seriesRow}>
          <span>{point.label}</span>
          <strong>{numberFormat.format(point.value)}</strong>
        </li>
      ))}
    </ul>
  );
};

/** A single dashboard widget tile, fetching its own data for the active period. */
export const WidgetTile = ({
  widget,
  period,
}: {
  readonly widget: WidgetInstance;
  readonly period: DashboardPeriod;
}): ReactElement => {
  const query = useWidgetData(widget, period);

  return (
    <div className={styles.tile}>
      <div className={styles.tileHead}>
        <span className={styles.tileTitle}>{widget.displayName}</span>
        <Badge tone="neutral" size="sm">
          {widget.category}
        </Badge>
      </div>
      {query.isPending ? <Spinner label={`Loading ${widget.displayName}`} /> : null}
      {query.isError ? <span className={styles.muted}>Unavailable</span> : null}
      {query.isSuccess ? <TileBody data={query.data} /> : null}
    </div>
  );
};
