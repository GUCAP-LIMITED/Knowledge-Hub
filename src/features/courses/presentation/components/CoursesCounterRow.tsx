import type { ReactElement } from 'react';
import { GraduationCap } from 'lucide-react';
import { CatalogCounterRow } from '@shared/ui';

export interface CoursesCounterRowProps {
  readonly count: number;
  readonly isLoading: boolean;
  readonly filtered: boolean;
}

/** Dynamic course counter pill rendered under the short summary and above filters. */
export const CoursesCounterRow = ({
  count,
  isLoading,
  filtered,
}: CoursesCounterRowProps): ReactElement => (
  <CatalogCounterRow
    count={count}
    isLoading={isLoading}
    filtered={filtered}
    singular="course"
    plural="courses"
    icon={GraduationCap}
  />
);
