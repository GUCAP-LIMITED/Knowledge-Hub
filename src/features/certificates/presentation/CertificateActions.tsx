import { useState, type ReactElement } from 'react';
import { Check, Copy, Download, Share2 } from 'lucide-react';
import { Button } from '@shared/ui';
import { useFileDownload } from '@shared/utils';
import type { Certificate } from '../domain';
import { certificateFilename, verifyUrl } from './certificate-view';
import { CertificateShareModal } from './CertificateShareModal';
import styles from './CertificatesPage.module.css';

export interface CertificateActionsProps {
  readonly certificate: Certificate;
}

/** Footer actions for the certificate modal: copy public URL, share to social platforms, download. */
export const CertificateActions = ({
  certificate,
}: CertificateActionsProps): ReactElement => {
  const { isDownloading, download } = useFileDownload();
  const { blobUrl } = certificate;
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  const handleCopyUrl = (): void => {
    void navigator.clipboard.writeText(verifyUrl(certificate));
    setUrlCopied(true);
    setTimeout(() => {
      setUrlCopied(false);
    }, 2000);
  };

  return (
    <>
      <Button variant="ghost" className={styles.actionBtn} onClick={handleCopyUrl}>
        {urlCopied ? (
          <>
            <Check size={15} aria-hidden="true" /> URL Copied
          </>
        ) : (
          <>
            <Copy size={15} aria-hidden="true" /> Copy URL
          </>
        )}
      </Button>
      <Button
        variant="ghost"
        className={styles.actionBtn}
        onClick={() => {
          setIsShareOpen(true);
        }}
      >
        <Share2 size={15} aria-hidden="true" /> Share
      </Button>
      <Button
        disabled={blobUrl === undefined}
        isLoading={isDownloading}
        onClick={() => {
          if (blobUrl === undefined) return;
          void download(blobUrl, certificateFilename(certificate));
        }}
      >
        <Download size={15} aria-hidden="true" /> Download
      </Button>
      <CertificateShareModal
        certificate={isShareOpen ? certificate : null}
        onClose={() => {
          setIsShareOpen(false);
        }}
      />
    </>
  );
};
