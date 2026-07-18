import { type ReactElement, useState } from 'react';
import {
  Alert,
  Button,
  DeleteConfirmDialog,
  EmptyState,
  PageHeader,
  Spinner,
} from '@shared/ui';
import type { Team } from '../domain';
import { TeamRow } from './TeamRow';
import { TeamFormModal } from './TeamFormModal';
import { useDeleteTeam, useTeams } from './use-teams';
import styles from './TeamsPage.module.css';

/**
 * Team management: create/edit teams (named groups of user types) that drive Team-visibility content
 * sharing, and delete them. Backed by `/api/app/team`. Gated to `Team.Manage` by the router.
 */
export const TeamsPage = (): ReactElement => {
  const teams = useTeams();
  const deleteTeam = useDeleteTeam();
  const [editing, setEditing] = useState<Team | 'new' | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Team | null>(null);

  const confirmDelete = (id: string): void => {
    deleteTeam.mutate(id, {
      onSettled: () => {
        setPendingDelete(null);
      },
    });
  };

  return (
    <main className={styles.screen}>
      <PageHeader
        title="Teams"
        subtitle="Group user types into teams for Team-visibility content sharing."
      >
        <Button
          onClick={() => {
            setEditing('new');
          }}
        >
          New team
        </Button>
      </PageHeader>

      {teams.isPending ? (
        <div className={styles.center}>
          <Spinner size="lg" label="Loading teams" />
        </div>
      ) : null}

      {teams.isError ? (
        <Alert tone="error" title="Could not load teams">
          {teams.error.message}
        </Alert>
      ) : null}

      {teams.isSuccess && teams.data.length === 0 ? (
        <EmptyState
          title="No teams yet"
          description="Create one to start sharing Team-visibility content."
        />
      ) : null}

      {teams.isSuccess && teams.data.length > 0 ? (
        <ul className={styles.list}>
          {teams.data.map((team) => (
            <TeamRow
              key={team.id}
              team={team}
              onEdit={setEditing}
              onDelete={setPendingDelete}
            />
          ))}
        </ul>
      ) : null}

      {editing !== null ? (
        <TeamFormModal
          team={editing === 'new' ? null : editing}
          onClose={() => {
            setEditing(null);
          }}
        />
      ) : null}

      <DeleteConfirmDialog
        item={
          pendingDelete !== null
            ? { id: pendingDelete.id, title: pendingDelete.name }
            : null
        }
        noun="team"
        isBusy={deleteTeam.isPending}
        onConfirm={confirmDelete}
        onCancel={() => {
          setPendingDelete(null);
        }}
      />
    </main>
  );
};
