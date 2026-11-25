import type { ReactElement } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { WidgetData } from '../../../domain';
import { computeMaxChars, formatTickLabel } from './series-chart-utils';
import styles from './WidgetViews.module.css';

interface TruncatedTickProps {
  readonly x?: number;
  readonly y?: number;
  readonly payload?: { readonly value: string };
  readonly maxChars?: number;
  readonly width?: number;
  readonly visibleTicksCount?: number;
  readonly itemCount?: number;
}

export const TruncatedTick = ({
  x,
  y,
  payload,
  maxChars,
  width,
  visibleTicksCount,
  itemCount,
}: TruncatedTickProps): ReactElement => {
  const tickCount = visibleTicksCount ?? itemCount;
  const effectiveMaxChars = maxChars ?? computeMaxChars(width, tickCount);
  const raw = payload?.value ?? '';
  const display = formatTickLabel(raw, effectiveMaxChars);
  return (
    <text
      x={x}
      y={y}
      dy={12}
      textAnchor="middle"
      fontSize={11}
      fill="var(--color-text-muted)"
      fontFamily="inherit"
    >
      <title>{raw}</title>
      {display}
    </text>
  );
};

const CHART_MARGIN = { top: 8, right: 10, left: 0, bottom: 5 } as const;

const CHART_TOOLTIP_STYLE = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  fontSize: '12px',
  fontFamily: 'inherit',
  color: 'var(--color-text)',
  boxShadow: 'var(--shadow-md)',
  padding: '6px 10px',
} as const;

const CHART_LABEL_STYLE = {
  fontWeight: 600,
  color: 'var(--color-text)',
  marginBottom: 2,
} as const;

const CHART_ITEM_STYLE = { color: 'var(--color-primary)' } as const;

const AXIS_TICK_STYLE = {
  fontSize: 11,
  fill: 'var(--color-text-muted)',
  fontFamily: 'inherit',
} as const;

interface ChartProps {
  readonly data: { name: string; value: number }[];
}

const SeriesLineChart = ({ data }: ChartProps): ReactElement => (
  <ResponsiveContainer width="100%" height="100%" minHeight={140} minWidth={0}>
    <LineChart data={data} margin={CHART_MARGIN}>
      <CartesianGrid
        strokeDasharray="3 3"
        stroke="var(--color-border)"
        vertical={false}
      />
      <XAxis
        dataKey="name"
        interval={0}
        tick={<TruncatedTick itemCount={data.length} />}
        stroke="var(--color-border)"
        tickLine={false}
      />
      <YAxis
        tick={AXIS_TICK_STYLE}
        stroke="var(--color-border)"
        tickLine={false}
        axisLine={false}
        width={38}
      />
      <Tooltip
        contentStyle={CHART_TOOLTIP_STYLE}
        labelStyle={CHART_LABEL_STYLE}
        itemStyle={CHART_ITEM_STYLE}
      />
      <Line
        type="monotone"
        dataKey="value"
        stroke="var(--color-primary)"
        strokeWidth={2}
        dot={{ r: 3, fill: 'var(--color-primary)' }}
      />
    </LineChart>
  </ResponsiveContainer>
);

const SeriesAreaChart = ({ data }: ChartProps): ReactElement => (
  <ResponsiveContainer width="100%" height="100%" minHeight={140} minWidth={0}>
    <AreaChart data={data} margin={CHART_MARGIN}>
      <CartesianGrid
        strokeDasharray="3 3"
        stroke="var(--color-border)"
        vertical={false}
      />
      <XAxis
        dataKey="name"
        interval={0}
        tick={<TruncatedTick itemCount={data.length} />}
        stroke="var(--color-border)"
        tickLine={false}
      />
      <YAxis
        tick={AXIS_TICK_STYLE}
        stroke="var(--color-border)"
        tickLine={false}
        axisLine={false}
        width={38}
      />
      <Tooltip
        contentStyle={CHART_TOOLTIP_STYLE}
        labelStyle={CHART_LABEL_STYLE}
        itemStyle={CHART_ITEM_STYLE}
      />
      <Area
        type="monotone"
        dataKey="value"
        stroke="var(--color-primary)"
        fill="var(--color-primary-soft)"
        strokeWidth={2}
        dot={{ r: 3, fill: 'var(--color-primary)' }}
      />
    </AreaChart>
  </ResponsiveContainer>
);

const SeriesBarChart = ({ data }: ChartProps): ReactElement => (
  <ResponsiveContainer width="100%" height="100%" minHeight={140} minWidth={0}>
    <BarChart data={data} margin={CHART_MARGIN}>
      <CartesianGrid
        strokeDasharray="3 3"
        stroke="var(--color-border)"
        vertical={false}
      />
      <XAxis
        dataKey="name"
        interval={0}
        tick={<TruncatedTick itemCount={data.length} />}
        stroke="var(--color-border)"
        tickLine={false}
      />
      <YAxis
        tick={AXIS_TICK_STYLE}
        stroke="var(--color-border)"
        tickLine={false}
        axisLine={false}
        width={38}
      />
      <Tooltip
        contentStyle={CHART_TOOLTIP_STYLE}
        labelStyle={CHART_LABEL_STYLE}
        itemStyle={CHART_ITEM_STYLE}
      />
      <Bar
        dataKey="value"
        fill="var(--color-primary)"
        radius={[4, 4, 0, 0]}
        maxBarSize={48}
      />
    </BarChart>
  </ResponsiveContainer>
);

function renderChartContent(
  chartType: string,
  chartData: { name: string; value: number }[],
): ReactElement {
  if (chartType === 'line') {
    return <SeriesLineChart data={chartData} />;
  }
  if (chartType === 'area') {
    return <SeriesAreaChart data={chartData} />;
  }
  return <SeriesBarChart data={chartData} />;
}

export const SeriesWidgetView = ({
  data,
  config,
}: {
  readonly data: WidgetData;
  readonly config?: unknown;
}): ReactElement => {
  const points = data.series;
  if (points.length === 0) {
    return <div className={styles.emptyState}>No data available for this period</div>;
  }

  const chartData = points.map((p) => ({
    name: p.label,
    value: p.value,
  }));

  const configMap =
    typeof config === 'object' && config !== null
      ? (config as { readonly chartType?: string })
      : {};
  const chartType = configMap.chartType ?? 'bar';

  return (
    <div className={styles.seriesContainer}>
      {renderChartContent(chartType, chartData)}
    </div>
  );
};
