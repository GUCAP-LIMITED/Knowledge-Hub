import { useState } from 'react';
import { useToast } from '@shared/ui';
import {
  type EmailTemplate,
  type CreateEmailTemplateInput,
  type UpdateEmailTemplateInput,
} from './types';
import {
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  useDeleteEmailTemplate,
  useSetTemplateActive,
} from './use-email-templates';

export interface TemplateActions {
  readonly isModalOpen: boolean;
  readonly setIsModalOpen: (open: boolean) => void;
  readonly editingTemplate: EmailTemplate | null;
  readonly setEditingTemplate: (template: EmailTemplate | null) => void;
  readonly deleteId: string | null;
  readonly setDeleteId: (id: string | null) => void;
  readonly isSaving: boolean;
  readonly isDeleting: boolean;
  readonly handleSave: (
    input: CreateEmailTemplateInput | UpdateEmailTemplateInput,
  ) => void;
  readonly handleToggleActive: (template: EmailTemplate, nextActive: boolean) => void;
  readonly handleDeleteConfirm: () => void;
}

interface ModalState {
  readonly isModalOpen: boolean;
  readonly setIsModalOpen: (open: boolean) => void;
  readonly editingTemplate: EmailTemplate | null;
  readonly setEditingTemplate: (template: EmailTemplate | null) => void;
  readonly deleteId: string | null;
  readonly setDeleteId: (id: string | null) => void;
}

const useTemplateModalState = (): ModalState => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return {
    isModalOpen,
    setIsModalOpen,
    editingTemplate,
    setEditingTemplate,
    deleteId,
    setDeleteId,
  };
};

const toUpdatePayload = (
  input: CreateEmailTemplateInput | UpdateEmailTemplateInput,
): UpdateEmailTemplateInput => ({
  name: input.name,
  body: input.body,
  kind: input.kind,
  isActive: input.isActive ?? true,
});

export const useTemplateActions = (): TemplateActions => {
  const modals = useTemplateModalState();
  const createMutation = useCreateEmailTemplate();
  const updateMutation = useUpdateEmailTemplate();
  const deleteMutation = useDeleteEmailTemplate();
  const setActiveMutation = useSetTemplateActive();
  const { push } = useToast();

  const handleSave = (
    input: CreateEmailTemplateInput | UpdateEmailTemplateInput,
  ): void => {
    if (modals.editingTemplate) {
      updateMutation.mutate(
        { id: modals.editingTemplate.id, input: toUpdatePayload(input) },
        {
          onSuccess: () => {
            push('success', 'Template updated successfully.');
            modals.setIsModalOpen(false);
          },
          onError: (err) => {
            push('error', err.message);
          },
        },
      );
      return;
    }

    createMutation.mutate(input, {
      onSuccess: () => {
        push('success', 'Template created successfully.');
        modals.setIsModalOpen(false);
      },
      onError: (err) => {
        push('error', err.message);
      },
    });
  };

  const handleToggleActive = (template: EmailTemplate, nextActive: boolean): void => {
    setActiveMutation.mutate(
      { id: template.id, isActive: nextActive },
      {
        onSuccess: () => {
          push(
            'success',
            `Template “${template.name}” ${nextActive ? 'activated' : 'deactivated'}.`,
          );
        },
        onError: (err) => {
          push('error', err.message);
        },
      },
    );
  };

  const handleDeleteConfirm = (): void => {
    if (!modals.deleteId) return;
    deleteMutation.mutate(modals.deleteId, {
      onSuccess: () => {
        push('success', 'Template deleted successfully.');
        modals.setDeleteId(null);
      },
      onError: (err) => {
        push('error', err.message);
        modals.setDeleteId(null);
      },
    });
  };

  return {
    ...modals,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    handleSave,
    handleToggleActive,
    handleDeleteConfirm,
  };
};
