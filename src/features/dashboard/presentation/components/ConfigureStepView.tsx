import type { ReactElement } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button, Select } from '@shared/ui';
import type { WidgetHeightValue, WidgetWidthValue } from '../../domain';
import { HEIGHT_OPTIONS, WIDTH_OPTIONS } from './catalog-constants';
import styles from './AddWidgetModal.module.css';

export interface ConfigureStepProps {
  readonly width: WidgetWidthValue;
  readonly height: WidgetHeightValue;
  readonly onBack: () => void;
  readonly onWidthChange: (w: WidgetWidthValue) => void;
  readonly onHeightChange: (h: WidgetHeightValue) => void;
}

export const ConfigureStepView = ({
  width,
  height,
  onBack,
  onWidthChange,
  onHeightChange,
}: ConfigureStepProps): ReactElement => (
  <div className={styles.configFields}>
    <div className={styles.stepHeader}>
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ChevronLeft aria-hidden="true" />
        <span>Return to catalog</span>
      </Button>
    </div>
    <Select
      label="Grid Width"
      value={String(width)}
      onChange={(v) => {
        onWidthChange(Number(v) as WidgetWidthValue);
      }}
      options={WIDTH_OPTIONS}
    />
    <Select
      label="Grid Height"
      value={String(height)}
      onChange={(v) => {
        onHeightChange(Number(v) as WidgetHeightValue);
      }}
      options={HEIGHT_OPTIONS}
    />
  </div>
);
