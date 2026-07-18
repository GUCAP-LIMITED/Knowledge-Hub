import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { GitBranch } from 'lucide-react';
import { Select, Toggle } from '@shared/ui';
import { useAuth } from '@features/auth';
import { type BranchOption, useMyBranches } from '@features/content';
import type { Details } from './upload-details';
import { DetailsSection } from './UploadDetailsSections';
import styles from './UploadPage.module.css';

type Register = UseFormRegister<Details>;

const BranchOptions = ({
  query,
}: {
  readonly query: UseQueryResult<readonly BranchOption[]>;
}): ReactElement => {
  if (query.isLoading) {
    return (
      <option value="" disabled>
        Loading…
      </option>
    );
  }
  return (
    <>
      {(query.data ?? []).map((branch) => (
        <option key={branch.id} value={branch.id}>
          {branch.name}
        </option>
      ))}
    </>
  );
};

/**
 * "Restrict to a branch" toggle. Off = visible to all branches. When on: a multi-branch author picks a
 * branch; a single-branch author's one branch is auto-applied by the backend. Hidden for users with no
 * assigned branches (e.g. host/global admins — branch scoping is a tenant concern).
 */
export const BranchField = ({
  register,
  watch,
  setValue,
  errors,
}: {
  readonly register: Register;
  readonly watch: UseFormWatch<Details>;
  readonly setValue: UseFormSetValue<Details>;
  readonly errors: FieldErrors<Details>;
}): ReactElement | null => {
  const { user } = useAuth();
  const branchCount = user?.branchIds.length ?? 0;
  const restrict = watch('restrictToBranch');
  const branches = useMyBranches(branchCount > 1 && restrict);
  if (branchCount === 0) {
    return null;
  }
  return (
    <DetailsSection icon={GitBranch} title="Branch">
      <Toggle
        checked={restrict}
        onChange={(value) => {
          setValue('restrictToBranch', value);
        }}
        label="Restrict to a branch"
        description="Off: visible to all branches. On: only the chosen branch can see this content."
      />
      {restrict && branchCount > 1 ? (
        <Select
          label="Branch"
          required
          error={errors.branch?.message ?? ''}
          {...register('branch')}
        >
          <option value="">Select a branch…</option>
          <BranchOptions query={branches} />
        </Select>
      ) : null}
      {restrict && branchCount === 1 ? (
        <p className={styles.visDesc}>Limited to your branch.</p>
      ) : null}
    </DetailsSection>
  );
};
