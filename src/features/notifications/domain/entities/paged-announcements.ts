import type { Announcement } from './announcement';

export interface PagedAnnouncementsResult {
  readonly items: readonly Announcement[];
  readonly totalCount: number;
}
