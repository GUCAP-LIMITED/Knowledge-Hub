import { describe, expect, it } from 'vitest';
import type { WidgetConfigField } from './dashboard-view';
import {
  buildWidgetConfig,
  snapHeight,
  snapWidth,
  WIDGET_HEIGHT_OPTIONS,
  WIDGET_WIDTH_OPTIONS,
} from './widget-grid';

describe('widget-grid helpers', () => {
  it('snaps width to the nearest 12-column option', () => {
    expect(snapWidth(1)).toBe(3);
    expect(snapWidth(3)).toBe(3);
    expect(snapWidth(5)).toBe(4);
    expect(snapWidth(7)).toBe(6);
    expect(snapWidth(9)).toBe(8);
    expect(snapWidth(11)).toBe(12);
    expect(snapWidth(14)).toBe(12);
  });

  it('snaps height to the nearest row span option', () => {
    expect(snapHeight(1)).toBe(1);
    expect(snapHeight(2)).toBe(2);
    expect(snapHeight(3)).toBe(3);
    expect(snapHeight(4)).toBe(4);
    expect(snapHeight(6)).toBe(5);
  });

  it('provides predefined width and height options', () => {
    expect(WIDGET_WIDTH_OPTIONS.length).toBe(5);
    expect(WIDGET_HEIGHT_OPTIONS.length).toBe(5);
  });

  it('builds sanitized widget config coercing types and applying defaults', () => {
    const schema: readonly WidgetConfigField[] = [
      { key: 'limit', label: 'Limit', type: 'number', required: true, defaultValue: 10 },
      {
        key: 'showDelta',
        label: 'Show Delta',
        type: 'boolean',
        required: false,
        defaultValue: true,
      },
      {
        key: 'title',
        label: 'Custom Title',
        type: 'text',
        required: false,
        defaultValue: 'Default',
      },
    ];

    const result = buildWidgetConfig(schema, {
      limit: '25',
      showDelta: 'false',
      title: 'Customized',
      extraKey: 'retained',
    });

    expect(result).toEqual({
      limit: 25,
      showDelta: false,
      title: 'Customized',
      extraKey: 'retained',
    });
  });

  it('falls back to default values when instance config is missing', () => {
    const schema: readonly WidgetConfigField[] = [
      { key: 'limit', label: 'Limit', type: 'number', required: true, defaultValue: 5 },
    ];

    const result = buildWidgetConfig(schema, {});
    expect(result).toEqual({ limit: 5 });
  });
});
