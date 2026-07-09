import type { ReactElement } from 'react';
import { Badge, type BadgeTone } from '@shared/ui';
import type { ContentStatus } from '../domain';

const TONES: Record<ContentStatus, BadgeTone> = {
  draft: 'neutral',
  review: 'warning',
  published: 'success',
};

const LABELS: Record<ContentStatus, string> = {
  draft: 'Draft',
  review: 'In review',
  published: 'Published',
};

export interface ContentStatusBadgeProps {
  readonly status: ContentStatus;
}

/** Coloured badge for a content item's publishing status. */
export const ContentStatusBadge = ({ status }: ContentStatusBadgeProps): ReactElement => (
  <Badge tone={TONES[status]}>{LABELS[status]}</Badge>
);
