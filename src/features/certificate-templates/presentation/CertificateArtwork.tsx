import type { CSSProperties, ReactElement } from 'react';
import { QrCode } from 'lucide-react';
import type {
  CertificateDesign,
  CertificateKind,
} from '../store/certificate-template-store';
import { resolveBodyText, type CertificateArtworkData } from './certificate-artwork-data';
import { qrElementStyle, textElementStyle } from './certificate-element-style';
import { CertificateArtworkScaler } from './CertificateArtworkScaler';
import { FitNameText } from './FitNameText';
import styles from './CertificateArtwork.module.css';

export interface CertificateArtworkProps {
  readonly kind: CertificateKind;
  readonly design: CertificateDesign;
  readonly data: CertificateArtworkData;
}

/**
 * Renders one of the three certificate designs (course/tutorial/resource) filled with real or
 * sample recipient data. A single background image carries every decorative asset (corner
 * artwork, seal, logo, signature); heading/kicker/body-copy/name/QR are all live overlay
 * elements — course name has no element of its own, it's a `{{courseName}}` token the admin
 * places inside heading/kicker/body-copy wherever they want it. The single source of truth for
 * what a certificate looks like — used both by the admin editor's live preview and by the
 * learner-facing certificate view.
 */
export const CertificateArtwork = ({
  kind,
  design,
  data,
}: CertificateArtworkProps): ReactElement => {
  const canvasStyle: CSSProperties =
    design.backgroundImage !== undefined
      ? { backgroundImage: `url(${design.backgroundImage})` }
      : {};

  return (
    <CertificateArtworkScaler>
      <div className={styles.canvas} style={canvasStyle} data-kind={kind}>
        <p className={styles.textElement} style={textElementStyle(design.headingStyle)}>
          {resolveBodyText(design.heading, data)}
        </p>
        <p className={styles.textElement} style={textElementStyle(design.kickerStyle)}>
          {resolveBodyText(design.kicker, data)}
        </p>
        <FitNameText
          className={styles.textElement}
          style={textElementStyle(design.nameStyle)}
          text={data.userName}
          maxSize={design.nameStyle.fontSize}
        />
        <p className={styles.textElement} style={textElementStyle(design.bodyTextStyle)}>
          {resolveBodyText(design.bodyText, data)}
        </p>
        <div className={styles.qrElement} style={qrElementStyle(design.qrStyle)}>
          <QrCode size="100%" aria-hidden="true" />
        </div>
      </div>
    </CertificateArtworkScaler>
  );
};
