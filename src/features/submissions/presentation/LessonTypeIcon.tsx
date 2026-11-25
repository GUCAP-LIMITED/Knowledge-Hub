import type { CSSProperties, ReactElement } from 'react';
import { type LessonKindResolvable, resolveLessonTypeMeta } from './lesson-type-meta';

export interface LessonTypeIconProps {
  readonly kind: LessonKindResolvable;
  readonly size?: number;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly ariaHidden?: boolean;
}

export const LessonTypeIcon = ({
  kind,
  size = 14,
  className,
  style,
  ariaHidden = true,
}: LessonTypeIconProps): ReactElement => {
  const meta = resolveLessonTypeMeta(kind);
  const Icon = meta.icon;

  return (
    <Icon
      size={size}
      color={meta.color}
      opacity={meta.opacity}
      className={className}
      style={style}
      aria-hidden={ariaHidden}
      data-testid={`lesson-type-icon-${meta.key}`}
    />
  );
};
