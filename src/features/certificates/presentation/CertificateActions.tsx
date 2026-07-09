import type { ReactElement } from 'react';
import { Copy, Download, Share2 } from 'lucide-react';
import { Button } from '@shared/ui';
import type { Certificate } from '../domain';
import { downloadCertificate, verifyUrl } from './certificate-view';

export interface CertificateActionsProps {
  readonly certificate: Certificate;
}

/** Footer actions for the certificate modal: copy id, share verify link, download. */
export const CertificateActions = ({
  certificate,
}: CertificateActionsProps): ReactElement => (
  <>
    <Button
      variant="ghost"
      onClick={() => {
        void navigator.clipboard.writeText(certificate.credentialId);
      }}
    >
      <Copy size={15} aria-hidden="true" /> Copy ID
    </Button>
    <Button
      variant="ghost"
      onClick={() => {
        void navigator.clipboard.writeText(verifyUrl(certificate));
      }}
    >
      <Share2 size={15} aria-hidden="true" /> Share
    </Button>
    <Button
      onClick={() => {
        downloadCertificate(certificate);
      }}
    >
      <Download size={15} aria-hidden="true" /> Download
    </Button>
  </>
);
