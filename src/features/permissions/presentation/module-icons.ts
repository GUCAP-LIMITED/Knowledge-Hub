import {
  Award,
  BarChart3,
  BookOpen,
  CalendarCheck,
  ClipboardCheck,
  ClipboardList,
  FileCheck,
  FolderOpen,
  GitBranch,
  LayoutDashboard,
  Lightbulb,
  MessageSquare,
  PlayCircle,
  Settings,
  Shield,
  Star,
  Upload,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react';

/**
 * Maps the backend registry's icon *names* (returned as strings on each permission module) to Lucide
 * components. Keep in sync with `PermissionModuleRegistry` icon names; unknown names fall back to Shield.
 */
const ICON_MAP: Readonly<Record<string, LucideIcon>> = {
  LayoutDashboard,
  BookOpen,
  PlayCircle,
  Lightbulb,
  FolderOpen,
  Award,
  Star,
  ClipboardList,
  Upload,
  FileCheck,
  BarChart3,
  CalendarCheck,
  ClipboardCheck,
  MessageSquare,
  Users,
  UserCog,
  GitBranch,
  Settings,
};

/** Resolve a registry icon name to a Lucide component (Shield when unknown/null). */
export const iconFor = (name: string | null): LucideIcon => {
  if (name === null) return Shield;
  return ICON_MAP[name] ?? Shield;
};
