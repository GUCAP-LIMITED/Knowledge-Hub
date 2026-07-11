import type { ReactElement } from 'react';
import type { MonthPoint } from './team-analytics-data';
import styles from './TeamAnalytics.module.css';

const W = 320;
const H = 132;
const PAD_X = 12;
const PAD_Y = 18;

interface Pt {
  readonly x: number;
  readonly y: number;
}

const toCoords = (points: readonly MonthPoint[]): Pt[] => {
  const max = Math.max(1, ...points.map((point) => point.value));
  const span = Math.max(1, points.length - 1);
  const stepX = (W - PAD_X * 2) / span;
  return points.map((point, index) => ({
    x: PAD_X + index * stepX,
    y: H - PAD_Y - (point.value / max) * (H - PAD_Y * 2),
  }));
};

const linePath = (coords: readonly Pt[]): string =>
  coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${String(c.x)},${String(c.y)}`).join(' ');

const areaPath = (coords: readonly Pt[]): string => {
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first === undefined || last === undefined) return '';
  const base = H - PAD_Y;
  return `${linePath(coords)} L${String(last.x)},${String(base)} L${String(first.x)},${String(base)} Z`;
};

/** A compact area+line trend chart for a small labelled series. */
export const AreaChart = ({
  points,
}: {
  readonly points: readonly MonthPoint[];
}): ReactElement => {
  const coords = toCoords(points);
  return (
    <svg
      viewBox={`0 0 ${String(W)} ${String(H)}`}
      className={styles.chartSvg}
      role="img"
      aria-label="Trend over the last six months"
    >
      <path d={areaPath(coords)} className={styles.area} />
      <path d={linePath(coords)} className={styles.line} />
      {coords.map((c, i) => (
        <circle key={`dot-${String(i)}`} cx={c.x} cy={c.y} r={3} className={styles.dot} />
      ))}
      {points.map((point, i) => (
        <text
          key={`lbl-${String(i)}`}
          x={coords[i]?.x ?? 0}
          y={H - 3}
          className={styles.axisLabel}
          textAnchor="middle"
        >
          {point.label}
        </text>
      ))}
    </svg>
  );
};

const clamp = (value: number): number => Math.min(100, Math.max(0, value));

/** A donut gauge showing a 0–100 percentage. */
export const Gauge = ({
  value,
  caption,
}: {
  readonly value: number;
  readonly caption: string;
}): ReactElement => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamp(value) / 100) * circumference;
  return (
    <div className={styles.gauge}>
      <svg
        viewBox="0 0 130 130"
        className={styles.gaugeSvg}
        role="img"
        aria-label={caption}
      >
        <circle cx={65} cy={65} r={radius} className={styles.gaugeTrack} />
        <circle
          cx={65}
          cy={65}
          r={radius}
          className={styles.gaugeValue}
          strokeDasharray={`${String(dash)} ${String(circumference)}`}
          transform="rotate(-90 65 65)"
        />
        <text x={65} y={61} className={styles.gaugeNumber} textAnchor="middle">
          {value}%
        </text>
        <text x={65} y={82} className={styles.gaugeUnit} textAnchor="middle">
          complete
        </text>
      </svg>
      <p className={styles.gaugeCaption}>{caption}</p>
    </div>
  );
};
