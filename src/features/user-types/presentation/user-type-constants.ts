import {
  BarChart2,
  Briefcase,
  Building2,
  Globe,
  Layers,
  type LucideIcon,
  Shield,
  Star,
  Target,
  User,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';
import type { DataAccessScope, UserTypeHierarchyNode } from '../domain';

export interface ScopeOption {
  readonly value: DataAccessScope;
  readonly label: string;
  readonly description: string;
  readonly icon: LucideIcon;
}

export const DATA_ACCESS_SCOPE_OPTIONS: readonly ScopeOption[] = [
  {
    value: 0,
    label: 'Self',
    description: 'Can only view/modify their own created content.',
    icon: User,
  },
  {
    value: 5,
    label: 'Team',
    description: 'Can view/modify their subordinate and team content.',
    icon: Users,
  },
  {
    value: 10,
    label: 'Branch (All)',
    description: 'Can view and modify all content within their branch.',
    icon: Building2,
  },
  {
    value: 15,
    label: 'Full Access',
    description: 'Global access across all branches in tenant.',
    icon: Globe,
  },
];

export const USER_TYPE_CONSTRAINTS = {
  MAX_NAME_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 200,
} as const;

export const KNOWN_TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  'System Admin': { color: '#EF4444', bg: '#FEE2E2' },
  SystemAdmin: { color: '#EF4444', bg: '#FEE2E2' },
  Admin: { color: '#9333EA', bg: '#F3E8FF' },
  'Branch Manager': { color: '#7C3AED', bg: '#EDE9FE' },
  BranchManager: { color: '#7C3AED', bg: '#EDE9FE' },
  'Sales Manager': { color: '#2563EB', bg: '#DBEAFE' },
  SalesManager: { color: '#2563EB', bg: '#DBEAFE' },
  'Sales Team Leader': { color: '#059669', bg: '#D1FAE5' },
  TeamLeader: { color: '#059669', bg: '#D1FAE5' },
  Consultant: { color: '#D97706', bg: '#FEF3C7' },
  'Admission Manager': { color: '#059669', bg: '#D1FAE5' },
  'Associate Sales Executive': { color: '#2563EB', bg: '#DBEAFE' },
  'Key Account Manager': { color: '#7C3AED', bg: '#EDE9FE' },
};

const FALLBACK_TYPE_COLORS: readonly { color: string; bg: string }[] = [
  { color: '#6366F1', bg: '#EEF2FF' },
  { color: '#0891B2', bg: '#CFFAFE' },
  { color: '#DB2777', bg: '#FCE7F3' },
  { color: '#EA580C', bg: '#FFEDD5' },
  { color: '#10B981', bg: '#D1FAE5' },
];

export const KNOWN_TYPE_ICONS: Record<string, LucideIcon> = {
  'System Admin': Shield,
  SystemAdmin: Shield,
  Admin: Shield,
  'Branch Manager': Briefcase,
  BranchManager: Briefcase,
  'Sales Manager': BarChart2,
  SalesManager: BarChart2,
  'Sales Team Leader': Target,
  TeamLeader: Target,
  Consultant: User,
  'Admission Manager': Briefcase,
  'Associate Sales Executive': BarChart2,
  'Key Account Manager': Target,
};

const ICON_CYCLE: readonly LucideIcon[] = [
  UserPlus,
  Star,
  Layers,
  Globe,
  Zap,
  Shield,
  Briefcase,
  BarChart2,
  Target,
  User,
];

const colorCache = new Map<string, { color: string; bg: string }>();
const iconCache = new Map<string, LucideIcon>();

export function getNodeColor(typeName: string): { color: string; bg: string } {
  const match = KNOWN_TYPE_COLORS[typeName];
  if (match !== undefined) return match;
  const cached = colorCache.get(typeName);
  if (cached !== undefined) return cached;

  const fallback = FALLBACK_TYPE_COLORS[
    colorCache.size % FALLBACK_TYPE_COLORS.length
  ] ?? {
    color: '#6366F1',
    bg: '#EEF2FF',
  };
  colorCache.set(typeName, fallback);
  return fallback;
}

export function getNodeIcon(typeName: string): LucideIcon {
  const match = KNOWN_TYPE_ICONS[typeName];
  if (match !== undefined) return match;
  const cached = iconCache.get(typeName);
  if (cached !== undefined) return cached;

  const fallback = ICON_CYCLE[iconCache.size % ICON_CYCLE.length] ?? User;
  iconCache.set(typeName, fallback);
  return fallback;
}

export function flattenHierarchy(
  nodes: readonly UserTypeHierarchyNode[],
): UserTypeHierarchyNode[] {
  const result: UserTypeHierarchyNode[] = [];
  const seen = new Set<string>();

  function walk(ns: readonly UserTypeHierarchyNode[]): void {
    for (const node of ns) {
      if (!seen.has(node.userTypeId)) {
        seen.add(node.userTypeId);
        result.push(node);
        walk(node.reports);
      }
    }
  }

  walk(nodes);
  return result;
}

export function computeHierarchyLevel(
  flat: readonly UserTypeHierarchyNode[],
  insertAfterIndex: number,
  editTargetId?: string | null,
): number {
  const above = flat[insertAfterIndex];
  if (above === undefined) return 1;

  if (typeof editTargetId === 'string' && editTargetId.length > 0) {
    if (above.userTypeId === editTargetId) {
      return above.hierarchyLevel;
    }
    const others = flat.filter((n) => n.userTypeId !== editTargetId);
    const aboveIdxInOthers = others.findIndex((n) => n.userTypeId === above.userTypeId);
    if (aboveIdxInOthers === -1) {
      return above.hierarchyLevel;
    }
    const targetNewIndex = aboveIdxInOthers + 1;
    return Math.max(1, flat.length - targetNewIndex);
  }

  const targetNewIndex = insertAfterIndex + 1;
  return Math.max(1, flat.length + 1 - targetNewIndex);
}
