import {
  Rocket,
  Shield,
  TrendingUp,
  Megaphone,
  Package,
  Settings,
  Star,
  Code,
  Tag,
  type LucideIcon,
} from 'lucide-react';
import type { ReactElement } from 'react';
import { Badge, type BadgeSize, type BadgeTone } from '@shared/ui/Badge/Badge';

interface CategoryMeta {
  readonly tone: BadgeTone;
  readonly icon: LucideIcon;
}

/** Maps the approved content categories to a brand tone + icon. Unknown names fall back to neutral. */
const META: Record<string, CategoryMeta> = {
  Onboarding: { tone: 'primary', icon: Rocket },
  Compliance: { tone: 'info', icon: Shield },
  Sales: { tone: 'secondary', icon: TrendingUp },
  Marketing: { tone: 'warning', icon: Megaphone },
  Product: { tone: 'success', icon: Package },
  Operations: { tone: 'info', icon: Settings },
  Leadership: { tone: 'warning', icon: Star },
  Technical: { tone: 'danger', icon: Code },
};

const FALLBACK: CategoryMeta = { tone: 'neutral', icon: Tag };

export interface CategoryBadgeProps {
  readonly category: string;
  readonly size?: BadgeSize;
}

/** A category label rendered as a coloured, icon-prefixed badge. */
export const CategoryBadge = ({ category, size }: CategoryBadgeProps): ReactElement => {
  const meta = META[category] ?? FALLBACK;
  return (
    <Badge tone={meta.tone} icon={meta.icon} size={size ?? 'md'}>
      {category}
    </Badge>
  );
};
