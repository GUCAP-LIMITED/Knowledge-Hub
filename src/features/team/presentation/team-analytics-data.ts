/** Pure helpers for the dashboard analytics prototype (B1). No React, no I/O — easily testable. */

export interface MonthPoint {
  readonly label: string;
  readonly value: number;
}

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/** The first-of-month dates for the `count` months ending at (and including) `now`, oldest first. */
export const lastMonths = (now: Date, count: number): Date[] => {
  const out: Date[] = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    out.push(new Date(now.getFullYear(), now.getMonth() - offset, 1));
  }
  return out;
};

/** Count how many of `dates` fall in each of the last `count` months, as labelled points. */
export const monthlyCounts = (
  dates: readonly Date[],
  now: Date,
  count: number,
): MonthPoint[] =>
  lastMonths(now, count).map((month) => ({
    label: MONTH_LABELS[month.getMonth()] ?? '',
    value: dates.filter(
      (date) =>
        date.getFullYear() === month.getFullYear() &&
        date.getMonth() === month.getMonth(),
    ).length,
  }));

/** Whole-number average of a list of values (0 when empty). */
export const average = (values: readonly number[]): number =>
  values.length === 0
    ? 0
    : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

/** Whole-number percentage of `part` out of `total` (0 when total is 0). */
export const percentage = (part: number, total: number): number =>
  total === 0 ? 0 : Math.round((part / total) * 100);
