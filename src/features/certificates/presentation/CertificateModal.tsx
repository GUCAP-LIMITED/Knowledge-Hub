import { useContext, type ReactElement } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, Button, Celebration, Modal, Skeleton } from '@shared/ui';
import type { Certificate } from '../domain';
import { CertificateDisplay } from './CertificateDisplay';
import { CertificateActions } from './CertificateActions';
import { CertificatesModuleContext } from './certificates-module-context';
import { useCertificate } from './use-certificates';
import styles from './CertificatesPage.module.css';

export interface CertificateModalProps {
  /** Pre-resolved Certificate domain entity, if already loaded by the caller. */
  readonly certificate?: Certificate | null;
  /** Certificate ID to fetch on demand if entity is not pre-loaded. */
  readonly certificateId?: string | null;
  /** Explicit control of open state. If omitted, defaults to whether a certificate or ID is active. */
  readonly open?: boolean;
  /** Reference date for expiry computations. Defaults to module clock or current time. */
  readonly now?: Date;
  /** Callback when modal is closed. */
  readonly onClose: () => void;
}

interface CertificateModalBodyProps {
  readonly certificate: Certificate;
  readonly now: Date;
}

const CertificateModalBody = ({
  certificate,
  now,
}: CertificateModalBodyProps): ReactElement => {
  const daysLeft = certificate.daysUntilExpiry(now);
  const expiringSoon = certificate.isExpiringSoon(now);

  return (
    <div className={styles.modalBody}>
      <Celebration show={!expiringSoon} />
      {expiringSoon ? (
        <div className={styles.modalExpiry}>
          <AlertTriangle size={18} aria-hidden="true" />
          <span>
            This certificate expires in {daysLeft > 0 ? daysLeft : 0} days — consider
            re-certification.
          </span>
        </div>
      ) : null}
      <CertificateDisplay certificate={certificate} />
    </div>
  );
};

const CertificateModalSkeleton = (): ReactElement => (
  <div className={styles.modalBody}>
    <div
      className={styles.modalImageWrapper}
      style={{
        minHeight: '360px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
      }}
    >
      <Skeleton width="92%" height={320} radius={8} />
    </div>
  </div>
);

const CertificateModalError = ({
  onRetry,
}: {
  readonly onRetry: () => void;
}): ReactElement => (
  <div className={styles.modalBody}>
    <Alert tone="error" title="Could not load certificate">
      We could not retrieve the details for this certificate.
    </Alert>
    <div>
      <Button size="sm" variant="outline" onClick={onRetry}>
        <RefreshCw size={14} aria-hidden="true" /> Try again
      </Button>
    </div>
  </div>
);

interface ResolveModalOpenOptions {
  readonly openOverride?: boolean | undefined;
  readonly hasActiveCert: boolean;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly hasId: boolean;
}

const resolveModalOpen = ({
  openOverride,
  hasActiveCert,
  isLoading,
  isError,
  hasId,
}: ResolveModalOpenOptions): boolean => {
  if (openOverride !== undefined) {
    return openOverride;
  }
  return hasActiveCert || isLoading || isError || hasId;
};

interface CertificateModalContentProps {
  readonly certificate: Certificate | null;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly now: Date;
  readonly onRetry: () => void;
}

const CertificateModalContent = ({
  certificate,
  isLoading,
  isError,
  now,
  onRetry,
}: CertificateModalContentProps): ReactElement | null => {
  if (isLoading) {
    return <CertificateModalSkeleton />;
  }
  if (isError) {
    return <CertificateModalError onRetry={onRetry} />;
  }
  if (certificate !== null) {
    return <CertificateModalBody certificate={certificate} now={now} />;
  }
  return null;
};

const CertificateModalFooter = ({
  certificate,
}: {
  readonly certificate: Certificate | null;
}): ReactElement | null =>
  certificate !== null ? <CertificateActions certificate={certificate} /> : null;

/** Full certificate detail: expiry alert, branded certificate artwork, and export actions. */
export const CertificateModal = ({
  certificate,
  certificateId = null,
  open,
  now,
  onClose,
}: CertificateModalProps): ReactElement => {
  const certModule = useContext(CertificatesModuleContext);
  const effectiveNow = now ?? certModule?.clock.now() ?? new Date();

  const queryId = certificate ? null : (certificateId ?? null);
  const certQuery = useCertificate(queryId);

  const activeCertificate = certificate ?? certQuery.data ?? null;
  const isLoading = queryId !== null && certQuery.isLoading;
  const isError = queryId !== null && certQuery.isError && activeCertificate === null;

  const isModalOpen = resolveModalOpen({
    openOverride: open,
    hasActiveCert: activeCertificate !== null,
    isLoading,
    isError,
    hasId: Boolean(certificateId),
  });

  const handleOpenChange = (next: boolean): void => {
    if (!next) {
      onClose();
    }
  };

  return (
    <Modal
      open={isModalOpen}
      onOpenChange={handleOpenChange}
      title="Certificate of Achievement"
      size="xl"
      footer={<CertificateModalFooter certificate={activeCertificate} />}
    >
      <CertificateModalContent
        certificate={activeCertificate}
        isLoading={isLoading}
        isError={isError}
        now={effectiveNow}
        onRetry={() => void certQuery.refetch()}
      />
    </Modal>
  );
};
