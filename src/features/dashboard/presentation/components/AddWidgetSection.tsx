import type { ReactElement } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@shared/ui';
import { AddWidgetModal } from './AddWidgetModal';
import type { useDashboardLayout } from './useDashboardLayout';

export interface AddWidgetSectionProps {
  readonly isEditMode: boolean;
  readonly selectedUserTypeId: string | null;
  readonly showModal: boolean;
  readonly onOpenModal: () => void;
  readonly onCloseModal: (show: boolean) => void;
  readonly layout: ReturnType<typeof useDashboardLayout>;
}

export const AddWidgetSection = ({
  isEditMode,
  selectedUserTypeId,
  showModal,
  onOpenModal,
  onCloseModal,
  layout,
}: AddWidgetSectionProps): ReactElement => (
  <>
    {isEditMode && selectedUserTypeId ? (
      <Button variant="outline" size="lg" fullWidth onClick={onOpenModal}>
        <Plus aria-hidden="true" />
        <span>Add Widget</span>
      </Button>
    ) : null}
    <AddWidgetModal
      open={showModal}
      onOpenChange={onCloseModal}
      activeKeys={layout.activeKeys}
      onAdd={layout.handleAdd}
      onRemove={(key) => {
        const match = layout.allInstances.find((w) => w.widgetKey === key);
        if (match) layout.removeWidget(match.id);
      }}
    />
  </>
);
