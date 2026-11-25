import { DomainError } from '@core/errors';
import type { Result } from '@core/result';

export const EmailTemplateKind = {
  Email: 1,
  Sms: 2,
} as const;
export type EmailTemplateKind =
  (typeof EmailTemplateKind)[keyof typeof EmailTemplateKind];

export interface EmailTemplate {
  readonly id: string;
  readonly name: string;
  readonly body: string;
  readonly kind: EmailTemplateKind;
  readonly isDefault: boolean;
  readonly isActive: boolean;
  readonly ownerUserId: string | null;
  readonly creationTime: string;
  readonly lastModificationTime: string | null;
}

export interface GetEmailTemplatesFilter {
  readonly kind?: EmailTemplateKind | undefined;
  readonly isActive?: boolean | undefined;
  readonly searchText?: string | undefined;
}

export interface CreateEmailTemplateInput {
  readonly name: string;
  readonly body: string;
  readonly kind: EmailTemplateKind;
  readonly isDefault?: boolean | undefined;
  readonly isActive?: boolean | undefined;
}

export interface UpdateEmailTemplateInput {
  readonly name: string;
  readonly body: string;
  readonly kind: EmailTemplateKind;
  readonly isActive: boolean;
}

export class EmailTemplateError extends DomainError {
  public readonly code = 'EMAIL_TEMPLATE_ERROR';

  public constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'EmailTemplateError';
  }
}

export interface EmailTemplateGateway {
  getList(
    filter?: GetEmailTemplatesFilter,
  ): Promise<Result<readonly EmailTemplate[], EmailTemplateError>>;
  get(id: string): Promise<Result<EmailTemplate, EmailTemplateError>>;
  create(
    input: CreateEmailTemplateInput,
  ): Promise<Result<EmailTemplate, EmailTemplateError>>;
  update(
    id: string,
    input: UpdateEmailTemplateInput,
  ): Promise<Result<EmailTemplate, EmailTemplateError>>;
  setActive(
    id: string,
    isActive: boolean,
  ): Promise<Result<EmailTemplate, EmailTemplateError>>;
  delete(id: string): Promise<Result<void, EmailTemplateError>>;
}

export const PLACEHOLDERS = [
  { token: '{{UserName}}', label: 'User Name', sample: 'Alex Mercer' },
  { token: '{{UserEmail}}', label: 'User Email', sample: 'alex@uapp.uk' },
  { token: '{{CourseTitle}}', label: 'Course Title', sample: 'UK Compliance 101' },
  { token: '{{PortalUrl}}', label: 'Portal URL', sample: 'https://portal.uapp.uk' },
] as const;

export const renderPreviewText = (text: string): string => {
  let output = text;
  for (const { token, sample } of PLACEHOLDERS) {
    output = output.replaceAll(token, sample);
  }
  return output;
};
