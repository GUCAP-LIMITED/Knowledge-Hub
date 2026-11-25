import { useMemo, useState, type ReactElement } from 'react';
import { Alert, Button, EmptyState, Modal, Spinner } from '@shared/ui';
import {
  snapHeight,
  snapWidth,
  type WidgetCatalogItem,
  type WidgetHeightValue,
  type WidgetWidthValue,
} from '../../domain';
import { useWidgetCatalog } from '../use-dashboard';
import { CatalogStepView } from './CatalogStepView';
import { ConfigureStepView } from './ConfigureStepView';
import styles from './AddWidgetModal.module.css';

export interface AddWidgetModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly activeKeys: readonly string[];
  readonly allowedKeys?: readonly string[] | undefined;
  readonly onAdd: (
    item: WidgetCatalogItem,
    config: Record<string, unknown>,
    width: WidgetWidthValue,
    height: WidgetHeightValue,
  ) => void;
  readonly onRemove: (key: string) => void;
}

function useAddWidgetWorkflow(onOpenChange: (open: boolean) => void): {
  readonly step: 1 | 2;
  readonly setStep: (step: 1 | 2) => void;
  readonly selected: WidgetCatalogItem | null;
  readonly width: WidgetWidthValue;
  readonly setWidth: (w: WidgetWidthValue) => void;
  readonly height: WidgetHeightValue;
  readonly setHeight: (h: WidgetHeightValue) => void;
  readonly configValues: Record<string, unknown>;
  readonly handleSelectItem: (item: WidgetCatalogItem) => void;
  readonly reset: () => void;
  readonly handleOpenChange: (next: boolean) => void;
} {
  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<WidgetCatalogItem | null>(null);
  const [width, setWidth] = useState<WidgetWidthValue>(6);
  const [height, setHeight] = useState<WidgetHeightValue>(3);
  const [configValues, setConfigValues] = useState<Record<string, unknown>>({});

  const handleSelectItem = (item: WidgetCatalogItem): void => {
    setSelected(item);
    setWidth(snapWidth(item.defaultWidth));
    setHeight(snapHeight(item.defaultHeight));
    const defaults: Record<string, unknown> = {};
    for (const field of item.configSchema) {
      if (field.defaultValue !== undefined && field.defaultValue !== null) {
        defaults[field.key] = field.defaultValue;
      }
    }
    setConfigValues(defaults);
    setStep(2);
  };

  const reset = (): void => {
    setStep(1);
    setSelected(null);
  };

  const handleOpenChange = (next: boolean): void => {
    onOpenChange(next);
    if (!next) reset();
  };

  return {
    step,
    setStep,
    selected,
    width,
    setWidth,
    height,
    setHeight,
    configValues,
    handleSelectItem,
    reset,
    handleOpenChange,
  };
}

function groupCatalogByCategory(
  items: readonly WidgetCatalogItem[],
): Map<string, WidgetCatalogItem[]> {
  const map = new Map<string, WidgetCatalogItem[]>();
  for (const item of items) {
    const existing = map.get(item.category) ?? [];
    existing.push(item);
    map.set(item.category, existing);
  }
  return map;
}

const AddWidgetFooter = ({
  onBack,
  onAdd,
}: {
  readonly onBack: () => void;
  readonly onAdd: () => void;
}): ReactElement => (
  <div className={styles.modalFooter}>
    <Button variant="outline" onClick={onBack}>
      Back to catalog
    </Button>
    <Button variant="default" onClick={onAdd}>
      Place on grid
    </Button>
  </div>
);

function getModalMeta(
  step: 1 | 2,
  selected: WidgetCatalogItem | null,
): { title: string; description: string } {
  if (step === 1) {
    return {
      title: 'Add Widget to Dashboard',
      description: 'Select a widget from the catalog to place on your grid.',
    };
  }
  return {
    title: selected ? 'Configure — ' + selected.displayName : 'Configure',
    description: 'Choose sizing and default options for this tile.',
  };
}

interface ModalBodyProps {
  readonly step: 1 | 2;
  readonly isPending: boolean;
  readonly isError: boolean;
  readonly errorMessage?: string | undefined;
  readonly grouped: Map<string, WidgetCatalogItem[]>;
  readonly hasItems: boolean;
  readonly activeKeys: readonly string[];
  readonly width: WidgetWidthValue;
  readonly height: WidgetHeightValue;
  readonly onSelect: (item: WidgetCatalogItem) => void;
  readonly onRemove: (key: string) => void;
  readonly onBack: () => void;
  readonly onWidthChange: (w: WidgetWidthValue) => void;
  readonly onHeightChange: (h: WidgetHeightValue) => void;
}

const AddWidgetModalBody = (props: ModalBodyProps): ReactElement => {
  if (props.step === 2) {
    return (
      <div className={styles.stepContainer}>
        <ConfigureStepView
          width={props.width}
          height={props.height}
          onBack={props.onBack}
          onWidthChange={props.onWidthChange}
          onHeightChange={props.onHeightChange}
        />
      </div>
    );
  }

  if (props.isPending) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" label="Loading widget catalog..." />
      </div>
    );
  }

  if (props.isError) {
    return (
      <div className={styles.stepContainer}>
        <Alert tone="error" title="Could not load widget catalog">
          {props.errorMessage ?? 'Failed to load catalog'}
        </Alert>
      </div>
    );
  }

  if (!props.hasItems) {
    return (
      <div className={styles.stepContainer}>
        <EmptyState
          title="No widgets available"
          description="There are no widgets available in the catalog for your account."
        />
      </div>
    );
  }

  return (
    <div className={styles.stepContainer}>
      <CatalogStepView
        grouped={props.grouped}
        activeKeys={props.activeKeys}
        onSelect={props.onSelect}
        onRemove={props.onRemove}
      />
    </div>
  );
};

export const AddWidgetModal = ({
  open,
  onOpenChange,
  activeKeys,
  allowedKeys,
  onAdd,
  onRemove,
}: AddWidgetModalProps): ReactElement => {
  const catalogQuery = useWidgetCatalog(open);
  const catalogItems = useMemo(() => {
    const raw = catalogQuery.data ?? [];
    if (!allowedKeys) return raw;
    return raw.filter((item) => allowedKeys.includes(item.key));
  }, [catalogQuery.data, allowedKeys]);

  const {
    step,
    setStep,
    selected,
    width,
    setWidth,
    height,
    setHeight,
    configValues,
    handleSelectItem,
    reset,
    handleOpenChange,
  } = useAddWidgetWorkflow(onOpenChange);

  const grouped = useMemo(() => groupCatalogByCategory(catalogItems), [catalogItems]);
  const meta = getModalMeta(step, selected);

  const handleAdd = (): void => {
    if (!selected) return;
    onAdd(selected, configValues, width, height);
    onOpenChange(false);
    reset();
  };

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title={meta.title}
      description={meta.description}
      size="lg"
      footer={
        step === 2 ? (
          <AddWidgetFooter
            onBack={() => {
              setStep(1);
            }}
            onAdd={handleAdd}
          />
        ) : undefined
      }
    >
      <AddWidgetModalBody
        step={step}
        isPending={catalogQuery.isPending}
        isError={catalogQuery.isError}
        errorMessage={catalogQuery.error?.message}
        grouped={grouped}
        hasItems={catalogItems.length > 0}
        activeKeys={activeKeys}
        width={width}
        height={height}
        onSelect={handleSelectItem}
        onRemove={onRemove}
        onBack={() => {
          setStep(1);
        }}
        onWidthChange={setWidth}
        onHeightChange={setHeight}
      />
    </Modal>
  );
};
