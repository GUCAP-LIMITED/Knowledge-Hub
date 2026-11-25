import type { ReactElement } from 'react';
import type { WidgetData } from '../../../domain';
import styles from './WidgetViews.module.css';

const numberFormatter = new Intl.NumberFormat();

export const TableWidgetView = ({
  data,
}: {
  readonly data: WidgetData;
}): ReactElement => {
  const points = data.series;
  if (points.length === 0) {
    return <div className={styles.emptyState}>No table records found</div>;
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Item</th>
            <th style={{ textAlign: 'right' }}>Score / Value</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.label}>
              <td>{p.label}</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>
                {numberFormatter.format(p.value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
