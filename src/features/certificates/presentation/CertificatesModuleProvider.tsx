import type { ReactElement, ReactNode } from 'react';
import type { CertificatesModule } from '../certificates-module';
import { CertificatesModuleContext } from './certificates-module-context';

export interface CertificatesModuleProviderProps {
  readonly module: CertificatesModule;
  readonly children: ReactNode;
}

/** Provides the injected certificates use cases to the React tree. Wiring lives in the composition root. */
export const CertificatesModuleProvider = ({
  module,
  children,
}: CertificatesModuleProviderProps): ReactElement => (
  <CertificatesModuleContext.Provider value={module}>
    {children}
  </CertificatesModuleContext.Provider>
);
