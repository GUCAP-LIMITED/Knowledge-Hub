import { createContext } from 'react';
import type { CertificateTemplatesModule } from '../certificate-templates-module';

/** Holds the DI-built certificate-templates module. Populated by the provider at the composition root. */
export const CertificateTemplatesModuleContext =
  createContext<CertificateTemplatesModule | null>(null);
