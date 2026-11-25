import type { ReactElement, ReactNode } from 'react';
import type { CertificateTemplatesModule } from '../certificate-templates-module';
import { CertificateTemplatesModuleContext } from './certificate-templates-module-context';

export interface CertificateTemplatesModuleProviderProps {
  readonly module: CertificateTemplatesModule;
  readonly children: ReactNode;
}

/** Provides the injected certificate-templates use cases to the React tree. Wiring lives in the composition root. */
export const CertificateTemplatesModuleProvider = ({
  module,
  children,
}: CertificateTemplatesModuleProviderProps): ReactElement => (
  <CertificateTemplatesModuleContext.Provider value={module}>
    {children}
  </CertificateTemplatesModuleContext.Provider>
);
