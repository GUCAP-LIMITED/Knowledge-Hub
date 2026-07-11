import { describe, expect, it } from 'vitest';
import { average, lastMonths, monthlyCounts, percentage } from './team-analytics-data';

describe('dashboard-analytics-data', () => {
  const now = new Date(2026, 6, 15); // 15 Jul 2026

  it('lastMonths returns `count` first-of-month dates ending at now, oldest first', () => {
    const months = lastMonths(now, 6);
    expect(months).toHaveLength(6);
    expect(months[0]).toEqual(new Date(2026, 1, 1)); // Feb
    expect(months[5]).toEqual(new Date(2026, 6, 1)); // Jul
  });

  it('lastMonths crosses the year boundary correctly', () => {
    const months = lastMonths(new Date(2026, 1, 10), 4); // Feb 2026
    expect(months[0]).toEqual(new Date(2025, 10, 1)); // Nov 2025
    expect(months[3]).toEqual(new Date(2026, 1, 1)); // Feb 2026
  });

  it('monthlyCounts buckets dates into their month and labels them', () => {
    const dates = [
      new Date(2026, 6, 2),
      new Date(2026, 6, 20),
      new Date(2026, 5, 9),
      new Date(2025, 0, 1), // outside the window → ignored
    ];
    const points = monthlyCounts(dates, now, 3);
    expect(points.map((p) => p.label)).toEqual(['May', 'Jun', 'Jul']);
    expect(points.map((p) => p.value)).toEqual([0, 1, 2]);
  });

  it('average rounds and handles the empty case', () => {
    expect(average([50, 100, 75])).toBe(75);
    expect(average([])).toBe(0);
  });

  it('percentage rounds and guards divide-by-zero', () => {
    expect(percentage(1, 3)).toBe(33);
    expect(percentage(3, 0)).toBe(0);
  });
});
