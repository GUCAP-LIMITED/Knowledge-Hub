import { describe, expect, it } from 'vitest';
import type { WidgetDataDto } from './dto/dashboard-view-api.dto';
import {
  periodToInt,
  toConfigFieldType,
  toWidgetData,
  toWidgetKind,
} from './dashboard-view-mapper';

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

  it('normalizes the config field type integer', () => {
    expect(toConfigFieldType(0)).toBe('text');
    expect(toConfigFieldType(5)).toBe('number');
    expect(toConfigFieldType(10)).toBe('boolean');
    expect(toConfigFieldType(15)).toBe('select');
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

  it('maps route property when provided by backend', () => {
    const dto: WidgetDataDto = {
      widgetKey: 'action.review-queue',
      kind: 0,
      title: 'Review Queue',
      route: '/approvals',
      value: 5,
      delta: null,
      series: [],
      summary: null,
    };
    expect(toWidgetData(dto).route).toBe('/approvals');
  });

  it('maps route to null when omitted by backend', () => {
    const dto: WidgetDataDto = {
      widgetKey: 'action.review-queue',
      kind: 0,
      title: 'Review Queue',
      value: 5,
      delta: null,
      series: [],
      summary: null,
    };
    expect(toWidgetData(dto).route).toBeNull();
  });
});
