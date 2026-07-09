import {
  AlertTriangle,
  BookOpen,
  FolderOpen,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { Resource } from '../domain';

export type CategoryTone =
  | 'primary'
  | 'info'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger';

export interface CategoryGroup {
  readonly name: string;
  readonly count: number;
}

export interface CategoryMeta {
  readonly icon: LucideIcon;
  readonly tone: CategoryTone;
}

const META: Record<string, CategoryMeta> = {
  'Getting Started': { icon: BookOpen, tone: 'primary' },
  'Policies & SOPs': { icon: ShieldCheck, tone: 'info' },
  'Technical Guides': { icon: Wrench, tone: 'secondary' },
  FAQs: { icon: HelpCircle, tone: 'success' },
  'Best Practices': { icon: Sparkles, tone: 'warning' },
  Troubleshooting: { icon: AlertTriangle, tone: 'danger' },
};

/** Icon + accent tone for a category card (falls back to a generic folder). */
export const categoryMeta = (name: string): CategoryMeta =>
  META[name] ?? { icon: FolderOpen, tone: 'primary' };

/** Group resources into categories with article counts, in first-seen order. */
export const groupByCategory = (
  resources: readonly Resource[],
): readonly CategoryGroup[] => {
  const counts = new Map<string, number>();
  for (const resource of resources) {
    counts.set(resource.category, (counts.get(resource.category) ?? 0) + 1);
  }
  return [...counts.entries()].map(([name, count]) => ({ name, count }));
};

/** Most-viewed resources first. */
export const mostViewed = (resources: readonly Resource[]): readonly Resource[] =>
  [...resources].sort((a, b) => b.views - a.views);
