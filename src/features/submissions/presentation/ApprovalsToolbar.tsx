import type { ReactElement } from 'react';
import { FilterBar, Select, TextField } from '@shared/ui';

export interface ApprovalsToolbarProps {
  readonly query: string;
  readonly type: string;
  readonly types: readonly string[];
  readonly onQuery: (value: string) => void;
  readonly onType: (value: string) => void;
}

/** Search + content-type filter for the approval queue. */
export const ApprovalsToolbar = ({
  query,
  type,
  types,
  onQuery,
  onType,
}: ApprovalsToolbarProps): ReactElement => (
  <FilterBar
    search={
      <TextField
        label="Search"
        placeholder="Search title or submitter…"
        value={query}
        onChange={(event) => {
          onQuery(event.target.value);
        }}
      />
    }
    controls={
      <Select
        label="Content type"
        value={type}
        onChange={(event) => {
          onType(event.target.value);
        }}
      >
        <option value="all">All types</option>
        {types.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </Select>
    }
  />
);
