import { useContext } from 'react';
import type { CertificatesModule } from '../certificates-module';
import { CertificatesModuleContext } from './certificates-module-context';

/** Resolve the injected certificates use cases. Throws if used outside the provider. */
export const useCertificatesModule = (): CertificatesModule => {
  const module = useContext(CertificatesModuleContext);
  if (module === null) {
    throw new Error(
      'Certificates hooks must be used within <CertificatesModuleProvider>.',
    );
  }
  return module;
};
