import { useState, type ReactElement } from 'react';
import { Monitor, Smartphone, Tablet, type LucideIcon } from 'lucide-react';
import { Alert } from '@shared/ui';
import { cn } from '@shared/utils';
import type { QuizConfig, Section } from './upload-content-types';
import type { Details } from './upload-details';
import { useContentCategories, type CategoryKind } from '@features/content';
import { LearnerPreview } from './LearnerPreview';
import styles from './UploadPage.module.css';

type Device = 'desktop' | 'tablet' | 'mobile';

const DEVICES: readonly {
  readonly key: Device;
  readonly label: string;
  readonly icon: LucideIcon;
}[] = [
  { key: 'desktop', label: 'Desktop', icon: Monitor },
  { key: 'tablet', label: 'Tablet', icon: Tablet },
  { key: 'mobile', label: 'Mobile', icon: Smartphone },
];

const FRAME_CLASS: Record<Device, string> = {
  desktop: styles.frameDesktop ?? '',
  tablet: styles.frameTablet ?? '',
  mobile: styles.frameMobile ?? '',
};

export interface UploadPreviewStepProps {
  readonly details: Details;
  readonly sections: readonly Section[];
  readonly quiz?: QuizConfig | null | undefined;
  readonly author: string;
  readonly missing: readonly string[];
}

/** Step 5 — the exact learner card, in switchable device frames, plus a publish-readiness check. */
export const UploadPreviewStep = ({
  details,
  sections,
  quiz,
  author,
  missing,
}: UploadPreviewStepProps): ReactElement => {
  const [device, setDevice] = useState<Device>('desktop');
  const kind = details.type.toLowerCase() as CategoryKind;
  const { data: categories } = useContentCategories(kind);
  const categoryName = categories?.find((c) => c.id === details.category)?.name;

  return (
    <div className={styles.previewStep}>
      <div className={styles.deviceSwitch}>
        {DEVICES.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            className={cn(styles.deviceBtn, device === key && styles.deviceBtnActive)}
            onClick={() => {
              setDevice(key);
            }}
          >
            <Icon size={14} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      {missing.length > 0 ? (
        <Alert tone="warning" title="A few things are still missing">
          You can still save a draft, but publishing needs: {missing.join(', ')}.
        </Alert>
      ) : null}

      <div className={styles.previewStage}>
        <div className={cn(styles.frame, FRAME_CLASS[device])}>
          {device !== 'desktop' ? <div className={styles.deviceNotch} /> : null}
          <LearnerPreview
            details={details}
            sections={sections}
            quiz={quiz}
            author={author}
            compact={device !== 'desktop'}
            categoryName={categoryName}
          />
        </div>
      </div>
    </div>
  );
};
