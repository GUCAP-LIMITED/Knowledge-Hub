import type { ReactElement } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@shared/utils';
import type { WidgetData } from '../../../domain';
import styles from './WidgetViews.module.css';

const numberFormatter = new Intl.NumberFormat();

export const KpiWidgetView = ({ data }: { readonly data: WidgetData }): ReactElement => {
  const formattedValue =
    data.value !== null ? numberFormatter.format(data.value) : (data.summary ?? '—');

  const delta = data.delta;
  const deltaClass =
    delta !== null && delta > 0
      ? styles.deltaPositive
      : delta !== null && delta < 0
        ? styles.deltaNegative
        : styles.deltaNeutral;

  return (
    <div className={styles.kpiContainer}>
      <span className={styles.kpiValue}>{formattedValue}</span>
      {delta !== null ? (
        <div className={cn(styles.deltaBadge, deltaClass)}>
          {delta > 0 ? (
            <ArrowUpRight size={14} aria-hidden="true" />
          ) : delta < 0 ? (
            <ArrowDownRight size={14} aria-hidden="true" />
          ) : null}
          <span>
            {delta > 0 ? '+' : ''}
            {numberFormatter.format(delta)} vs previous
          </span>
        </div>
      ) : null}
    </div>
  );
};
