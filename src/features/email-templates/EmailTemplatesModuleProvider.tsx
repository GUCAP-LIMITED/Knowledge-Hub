import type { ReactElement, ReactNode } from 'react';
import {
  EmailTemplatesModuleContext,
  type EmailTemplatesModule,
} from './email-templates-module';

export interface EmailTemplatesModuleProviderProps {
  readonly module: EmailTemplatesModule;
  readonly children: ReactNode;
}

export const EmailTemplatesModuleProvider = ({
  module,
  children,
}: EmailTemplatesModuleProviderProps): ReactElement => (
  <EmailTemplatesModuleContext.Provider value={module}>
    {children}
  </EmailTemplatesModuleContext.Provider>
);
