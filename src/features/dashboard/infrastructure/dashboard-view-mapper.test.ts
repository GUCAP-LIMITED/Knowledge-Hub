import { describe, expect, it } from 'vitest';
import type { WidgetDataDto } from './dto/dashboard-view-api.dto';
import { periodToInt, toWidgetData, toWidgetKind } from './dashboard-view-mapper';

describe('dashboard mappers', () => {
  it('normalizes the widget kind integer', () => {
    expect(toWidgetKind(0)).toBe('kpi');
    expect(toWidgetKind(5)).toBe('series');
    expect(toWidgetKind(20)).toBe('report');
    expect(toWidgetKind(99)).toBe('kpi');
  });

  it('encodes periods as step-of-5 integers', () => {
    expect(periodToInt('today')).toBe(0);
    expect(periodToInt('thisMonth')).toBe(10);
    expect(periodToInt('thisYear')).toBe(20);
  });

  it('coerces a string KPI value to a number', () => {
    const dto: WidgetDataDto = {
      widgetKey: 'courses.total',
      kind: 0,
      title: 'Total',
      value: '42',
      delta: null,
      series: [],
      summary: null,
    };
    expect(toWidgetData(dto).value).toBe(42);
  });
});
