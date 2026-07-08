import { createContext } from 'react';
import type { CertificatesModule } from '../certificates-module';

/**
 * Holds the DI-built certificates module. Populated by `CertificatesModuleProvider` at the
 * composition root.
 */
export const CertificatesModuleContext = createContext<CertificatesModule | null>(null);
