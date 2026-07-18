import { type ReactElement, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Modal, TextField, Textarea } from '@shared/ui';
import { domainResolver } from '@shared/forms';
import { type CreateTeamInput, type Team, TeamName } from '../domain';
import { UserTypePicker } from './UserTypePicker';
import { useCreateTeam, useSelectableUserTypes, useUpdateTeam } from './use-teams';
import styles from './TeamsPage.module.css';

interface TeamFormValues {
  name: string;
  description: string;
}

export interface TeamFormModalProps {
  /** The team to edit, or null to create a new one. */
  readonly team: Team | null;
  readonly onClose: () => void;
}

/**
 * Create/edit modal. The name delegates validation to the TeamName value object via domainResolver
 * (the same rule the backend enforces); members are chosen with the UserTypePicker checkbox list.
 */
export const TeamFormModal = ({ team, onClose }: TeamFormModalProps): ReactElement => {
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const selectable = useSelectableUserTypes();
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    () => new Set(team?.members.map((member) => member.userTypeId) ?? []),
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeamFormValues>({
    defaultValues: { name: team?.name ?? '', description: team?.description ?? '' },
    resolver: domainResolver<TeamFormValues>({ name: (value) => TeamName.create(value) }),
  });

  const isSubmitting = createTeam.isPending || updateTeam.isPending;

  const toggle = (id: string): void => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onSubmit = handleSubmit((values) => {
    const input: CreateTeamInput = {
      name: values.name,
      description: values.description.trim() === '' ? null : values.description.trim(),
      userTypeIds: [...selectedIds],
    };
    if (team === null) createTeam.mutate(input, { onSuccess: onClose });
    else updateTeam.mutate({ id: team.id, input }, { onSuccess: onClose });
  });

  return (
    <Modal
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={team === null ? 'New team' : `Edit ${team.name}`}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="team-form" isLoading={isSubmitting}>
            {team === null ? 'Create team' : 'Save changes'}
          </Button>
        </>
      }
    >
      <form
        id="team-form"
        className={styles.form}
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <TextField
          label="Name"
          placeholder="e.g. The Sales Team"
          {...(errors.name?.message !== undefined ? { error: errors.name.message } : {})}
          {...register('name')}
        />
        <Textarea
          label="Description"
          placeholder="Optional"
          rows={2}
          {...register('description')}
        />
        <UserTypePicker query={selectable} selectedIds={selectedIds} onToggle={toggle} />
      </form>
    </Modal>
  );
};
