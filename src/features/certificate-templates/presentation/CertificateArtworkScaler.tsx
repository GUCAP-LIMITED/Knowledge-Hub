import { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';
import styles from './CertificateArtworkScaler.module.css';

/** Must match `.frame`'s fixed `width` in CertificateArtwork.module.css. */
const BASE_WIDTH = 700;

export interface CertificateArtworkScalerProps {
  readonly children: ReactNode;
}

/**
 * Wraps a fixed-width `CertificateArtwork` and uniformly scales the whole block to fit the
 * available width — every element keeps the exact same relative position/size at any render size.
 * Independently-responsive CSS (each property clamped to its own min/max) can drift out of
 * proportion with the other elements at the extremes; a single `transform: scale()` cannot.
 */
export const CertificateArtworkScaler = ({
  children,
}: CertificateArtworkScalerProps): ReactElement => {
  const outerRef = useRef<HTMLDivElement>(null);
  const scaledRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [naturalHeight, setNaturalHeight] = useState(0);

  useEffect(() => {
    const outer = outerRef.current;
    const scaled = scaledRef.current;
    if (outer === null || scaled === null) {
      return undefined;
    }
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === outer) {
          setScale(entry.contentRect.width / BASE_WIDTH);
        }
        if (entry.target === scaled) {
          setNaturalHeight(entry.contentRect.height);
        }
      }
    });
    observer.observe(outer);
    observer.observe(scaled);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={outerRef}
      className={styles.outer}
      style={{ height: naturalHeight * scale }}
    >
      <div
        ref={scaledRef}
        className={styles.scaled}
        style={{ width: BASE_WIDTH, transform: `scale(${String(scale)})` }}
      >
        {children}
      </div>
    </div>
  );
};
