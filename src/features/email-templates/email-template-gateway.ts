import { z } from 'zod';
import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import { err, ok, type Result } from '@core/result';
import {
  EmailTemplateError,
  EmailTemplateKind,
  type CreateEmailTemplateInput,
  type EmailTemplate,
  type EmailTemplateGateway,
  type GetEmailTemplatesFilter,
  type UpdateEmailTemplateInput,
} from './types';

const EmailTemplateDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  body: z.string(),
  kind: z.number(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  ownerUserId: z.string().nullable().optional(),
  creationTime: z.string(),
  lastModificationTime: z.string().nullable().optional(),
});

type EmailTemplateDto = z.infer<typeof EmailTemplateDtoSchema>;

const EmailTemplateListDtoSchema = z.object({
  totalCount: z.number(),
  items: z.array(EmailTemplateDtoSchema),
});

const mapDtoToEntity = (dto: EmailTemplateDto): EmailTemplate => ({
  id: dto.id,
  name: dto.name,
  body: dto.body,
  kind: dto.kind === 2 ? EmailTemplateKind.Sms : EmailTemplateKind.Email,
  isDefault: dto.isDefault,
  isActive: dto.isActive,
  ownerUserId: dto.ownerUserId ?? null,
  creationTime: dto.creationTime,
  lastModificationTime: dto.lastModificationTime ?? null,
});

export interface EmailTemplateHttpGatewayDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

export class EmailTemplateHttpGateway implements EmailTemplateGateway {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;

  public constructor({ httpClient, logger }: EmailTemplateHttpGatewayDeps) {
    this.httpClient = httpClient;
    this.logger = logger;
  }

  public async getList(
    filter?: GetEmailTemplatesFilter,
  ): Promise<Result<readonly EmailTemplate[], EmailTemplateError>> {
    try {
      const params = new URLSearchParams();
      if (filter?.kind !== undefined) {
        params.set('kind', String(filter.kind));
      }
      if (filter?.isActive !== undefined) {
        params.set('isActive', String(filter.isActive));
      }
      if (filter?.searchText) {
        params.set('filter', filter.searchText);
      }
      params.set('maxResultCount', '200');

      const queryString = params.toString();
      const url = `/api/app/communication-template${queryString ? `?${queryString}` : ''}`;
      const response = await this.httpClient.get<unknown>(url);

      const parsed = EmailTemplateListDtoSchema.safeParse(response);
      if (!parsed.success) {
        this.logger.error('Failed to parse template list response', {
          error: parsed.error,
        });
        return err(
          new EmailTemplateError(
            'Failed to parse template list from server.',
            parsed.error,
          ),
        );
      }

      return ok(parsed.data.items.map(mapDtoToEntity));
    } catch (error) {
      this.logger.error('Failed to fetch template list', { error });
      return err(
        new EmailTemplateError(
          'Failed to load communication templates from the server.',
          error,
        ),
      );
    }
  }

  public async get(id: string): Promise<Result<EmailTemplate, EmailTemplateError>> {
    try {
      const response = await this.httpClient.get<unknown>(
        `/api/app/communication-template/${id}`,
      );
      const parsed = EmailTemplateDtoSchema.safeParse(response);
      if (!parsed.success) {
        return err(
          new EmailTemplateError(
            'Failed to parse template details from server.',
            parsed.error,
          ),
        );
      }
      return ok(mapDtoToEntity(parsed.data));
    } catch (error) {
      return err(new EmailTemplateError('Failed to fetch template details.', error));
    }
  }

  public async create(
    input: CreateEmailTemplateInput,
  ): Promise<Result<EmailTemplate, EmailTemplateError>> {
    try {
      const payload = {
        name: input.name,
        body: input.body,
        kind: input.kind,
        isDefault: input.isDefault ?? false,
        isActive: input.isActive ?? true,
      };
      const response = await this.httpClient.post<unknown>(
        '/api/app/communication-template',
        payload,
      );
      const parsed = EmailTemplateDtoSchema.safeParse(response);
      if (!parsed.success) {
        return err(
          new EmailTemplateError(
            'Failed to parse created template response.',
            parsed.error,
          ),
        );
      }
      return ok(mapDtoToEntity(parsed.data));
    } catch (error) {
      return err(
        new EmailTemplateError('Failed to create communication template.', error),
      );
    }
  }

  public async update(
    id: string,
    input: UpdateEmailTemplateInput,
  ): Promise<Result<EmailTemplate, EmailTemplateError>> {
    try {
      const payload = {
        name: input.name,
        body: input.body,
        kind: input.kind,
        isActive: input.isActive,
      };
      const response = await this.httpClient.put<unknown>(
        `/api/app/communication-template/${id}`,
        payload,
      );
      const parsed = EmailTemplateDtoSchema.safeParse(response);
      if (!parsed.success) {
        return err(
          new EmailTemplateError(
            'Failed to parse updated template response.',
            parsed.error,
          ),
        );
      }
      return ok(mapDtoToEntity(parsed.data));
    } catch (error) {
      return err(
        new EmailTemplateError('Failed to update communication template.', error),
      );
    }
  }

  public async setActive(
    id: string,
    isActive: boolean,
  ): Promise<Result<EmailTemplate, EmailTemplateError>> {
    try {
      const response = await this.httpClient.put<unknown>(
        `/api/app/communication-template/${id}/set-active?isActive=${String(isActive)}`,
        {},
      );
      const parsed = EmailTemplateDtoSchema.safeParse(response);
      if (!parsed.success) {
        return err(
          new EmailTemplateError('Failed to parse set-active response.', parsed.error),
        );
      }
      return ok(mapDtoToEntity(parsed.data));
    } catch (error) {
      return err(
        new EmailTemplateError('Failed to toggle template active status.', error),
      );
    }
  }

  public async delete(id: string): Promise<Result<void, EmailTemplateError>> {
    try {
      await this.httpClient.delete(`/api/app/communication-template/${id}`);
      return ok(undefined);
    } catch (error) {
      return err(
        new EmailTemplateError('Failed to delete communication template.', error),
      );
    }
  }
}
