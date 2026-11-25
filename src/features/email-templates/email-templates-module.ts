import { createContext, useContext } from 'react';
import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import type { EmailTemplateGateway } from './types';
import { EmailTemplateHttpGateway } from './email-template-gateway';

export interface EmailTemplatesModuleDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

export interface EmailTemplatesModule {
  readonly gateway: EmailTemplateGateway;
}

export const createEmailTemplatesModule = (
  deps: EmailTemplatesModuleDeps,
): EmailTemplatesModule => ({
  gateway: new EmailTemplateHttpGateway({
    httpClient: deps.httpClient,
    logger: deps.logger,
  }),
});

export const EmailTemplatesModuleContext = createContext<EmailTemplatesModule | null>(
  null,
);

export const useEmailTemplatesModule = (): EmailTemplatesModule => {
  const context = useContext(EmailTemplatesModuleContext);
  if (!context) {
    throw new Error(
      'useEmailTemplatesModule must be used within an EmailTemplatesModuleProvider',
    );
  }
  return context;
};
