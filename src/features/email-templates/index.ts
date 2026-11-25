export {
  createEmailTemplatesModule,
  useEmailTemplatesModule,
  type EmailTemplatesModule,
  type EmailTemplatesModuleDeps,
} from './email-templates-module';
export { EmailTemplatesModuleProvider } from './EmailTemplatesModuleProvider';
export { EmailTemplatesManager } from './EmailTemplatesManager';
export {
  EmailTemplateKind,
  EmailTemplateError,
  type EmailTemplate,
  type CreateEmailTemplateInput,
  type UpdateEmailTemplateInput,
  type GetEmailTemplatesFilter,
  type EmailTemplateGateway,
} from './types';
export {
  useEmailTemplates,
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  useSetTemplateActive,
  useDeleteEmailTemplate,
} from './use-email-templates';
