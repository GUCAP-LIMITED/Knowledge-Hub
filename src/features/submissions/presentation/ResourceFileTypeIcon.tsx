import { type ReactElement } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  FileArchive,
  FileImage,
  FileCode,
  File as GenericFileIcon,
} from 'lucide-react';
import { cn } from '@shared/utils';
import { resolveResourceCategory, type ResourceCategoryKey } from './resource-file-types';
import styles from './ResourceFileTypeIcon.module.css';

const renderCategoryIcon = (key: ResourceCategoryKey, size: number): ReactElement => {
  switch (key) {
    case 'pdf':
    case 'word':
      return <FileText size={size} aria-hidden="true" />;
    case 'excel':
      return <FileSpreadsheet size={size} aria-hidden="true" />;
    case 'powerpoint':
      return <Presentation size={size} aria-hidden="true" />;
    case 'archive':
      return <FileArchive size={size} aria-hidden="true" />;
    case 'image':
      return <FileImage size={size} aria-hidden="true" />;
    case 'code':
      return <FileCode size={size} aria-hidden="true" />;
    case 'other':
    default:
      return <GenericFileIcon size={size} aria-hidden="true" />;
  }
};

export interface ResourceFileTypeIconProps {
  readonly fileName?: string | null;
  readonly mimeType?: string | null;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly className?: string;
}

export const ResourceFileTypeIcon = ({
  fileName,
  mimeType,
  size = 'md',
  className,
}: ResourceFileTypeIconProps): ReactElement => {
  const meta = resolveResourceCategory(fileName, mimeType);
  const sizeMap = { sm: 16, md: 20, lg: 24 };
  const iconPixel = sizeMap[size];

  const sizeClass =
    size === 'sm' ? styles.iconTileSm : size === 'lg' ? styles.iconTileLg : undefined;

  return (
    <div
      className={cn(styles.iconTile, meta.tileClass, sizeClass, className)}
      title={meta.label}
      aria-label={meta.label}
    >
      {renderCategoryIcon(meta.key, iconPixel)}
    </div>
  );
};

export interface ResourceFormatBadgeProps {
  readonly fileName?: string | null;
  readonly mimeType?: string | null;
  readonly className?: string;
}

export const ResourceFormatBadge = ({
  fileName,
  mimeType,
  className,
}: ResourceFormatBadgeProps): ReactElement => {
  const meta = resolveResourceCategory(fileName, mimeType);
  return (
    <span
      className={cn(styles.formatBadge, meta.tileClass, className)}
      title={meta.label}
    >
      {meta.badgeText}
    </span>
  );
};
