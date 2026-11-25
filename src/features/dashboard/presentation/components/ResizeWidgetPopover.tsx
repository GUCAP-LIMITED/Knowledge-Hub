import { useState, type ReactElement } from 'react';
import { Scaling } from 'lucide-react';
import { Button, Popover, Select } from '@shared/ui';
import {
  snapHeight,
  snapWidth,
  WIDGET_HEIGHT_OPTIONS,
  WIDGET_WIDTH_OPTIONS,
  type WidgetHeightValue,
  type WidgetWidthValue,
} from '../../domain';
import styles from './ResizeWidgetPopover.module.css';

export interface ResizeWidgetPopoverProps {
  readonly width: number;
  readonly height: number;
  readonly onSave: (width: WidgetWidthValue, height: WidgetHeightValue) => void;
}

const WIDTH_SELECT_OPTIONS = WIDGET_WIDTH_OPTIONS.map((opt) => ({
  value: String(opt.value),
  label: `${opt.label} (${String(opt.value)} cols)`,
}));

const HEIGHT_SELECT_OPTIONS = WIDGET_HEIGHT_OPTIONS.map((opt) => ({
  value: String(opt.value),
  label: `${opt.label} (${String(opt.value)} rows)`,
}));

export const ResizeWidgetPopover = ({
  width,
  height,
  onSave,
}: ResizeWidgetPopoverProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const [w, setW] = useState<WidgetWidthValue>(snapWidth(width));
  const [h, setH] = useState<WidgetHeightValue>(snapHeight(height));

  const handleOpenChange = (nextOpen: boolean): void => {
    if (nextOpen) {
      setW(snapWidth(width));
      setH(snapHeight(height));
    }
    setOpen(nextOpen);
  };

  const handleApply = (): void => {
    onSave(w, h);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={handleOpenChange}
      align="end"
      side="bottom"
      trigger={
        <button
          type="button"
          aria-label="Resize widget"
          className={styles.resizeTrigger}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Scaling size={12} aria-hidden="true" />
        </button>
      }
    >
      <div
        className={styles.panel}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Select
          label="Width"
          value={String(w)}
          onChange={(val) => {
            setW(Number(val) as WidgetWidthValue);
          }}
          options={WIDTH_SELECT_OPTIONS}
        />
        <Select
          label="Height"
          value={String(h)}
          onChange={(val) => {
            setH(Number(val) as WidgetHeightValue);
          }}
          options={HEIGHT_SELECT_OPTIONS}
        />
        <Button size="sm" variant="default" onClick={handleApply}>
          Apply size
        </Button>
      </div>
    </Popover>
  );
};
