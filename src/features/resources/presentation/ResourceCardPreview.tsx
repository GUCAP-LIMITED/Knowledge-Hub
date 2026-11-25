import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Button } from '@shared/ui';
import { cn, sanitizeRichText } from '@shared/utils';
import type { Resource } from '../domain';
import { getFormatInfo } from './resource-format-helper';
import styles from './ResourceCard.module.css';

export interface ResourceCardPreviewProps {
  readonly resource: Resource;
  readonly side: 'left' | 'right';
}

/** Udemy-style hover preview: title, freshness, format/category, and the full description. */
export const ResourceCardPreview = ({
  resource,
  side,
}: ResourceCardPreviewProps): ReactElement => {
  const navigate = useNavigate();
  const primaryUrl = resource.mediaUrl ?? '';
  const displayTitle = resource.primaryMediaName || resource.title;
  const formatInfo = getFormatInfo(primaryUrl, displayTitle);
  const metaLine = `${resource.category} · ${formatInfo.label}`;

  return (
    <div
      className={cn(
        styles.cardPreview,
        side === 'left' ? styles.cardPreviewLeft : styles.cardPreviewRight,
      )}
    >
      <div className={styles.cardPreviewScroll}>
        <div className={styles.previewHeader}>
          <h3 className={styles.previewTitle}>{resource.title}</h3>
          {resource.subtitle ? (
            <p className={styles.previewSubtitle}>{resource.subtitle}</p>
          ) : null}
        </div>
        <p className={styles.previewUpdated}>
          Updated {resource.updated.toLocaleDateString()}
        </p>
        <p className={styles.previewMeta}>{metaLine}</p>
        {resource.description ? (
          <div
            className={styles.previewDesc}
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(resource.description) }}
          />
        ) : null}
      </div>
      <div className={styles.cardPreviewFooter}>
        <Button
          size="sm"
          variant="default"
          onClick={() => {
            navigate(`/resources/${resource.slug || resource.id}`);
          }}
        >
          <Eye size={14} aria-hidden="true" /> View resource
        </Button>
      </div>
    </div>
  );
};
