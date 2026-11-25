import type {
  CreateTeamInput,
  SelectableUserType,
  Team,
  UpdateTeamInput,
} from '../entities/team';

/**
 * Port for the team taxonomy backend (`/api/app/team`). Throws (rejects) on failure — the react-query
 * hooks let TanStack surface the error and the global mutation-cache turns it into a toast.
 */
export interface TeamGateway {
  list(): Promise<readonly Team[]>;
  create(input: CreateTeamInput): Promise<Team>;
  update(id: string, input: UpdateTeamInput): Promise<Team>;
  remove(id: string): Promise<void>;
  selectableUserTypes(): Promise<readonly SelectableUserType[]>;
}
