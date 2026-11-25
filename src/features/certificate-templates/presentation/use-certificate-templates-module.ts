import { useContext } from 'react';
import type { CertificateTemplatesModule } from '../certificate-templates-module';
import { CertificateTemplatesModuleContext } from './certificate-templates-module-context';

/** Resolve the injected certificate-templates use cases. Throws if used outside the provider. */
export const useCertificateTemplatesModule = (): CertificateTemplatesModule => {
  const module = useContext(CertificateTemplatesModuleContext);
  if (module === null) {
    throw new Error(
      'Certificate-templates hooks must be used within <CertificateTemplatesModuleProvider>.',
    );
  }
  return module;
};
