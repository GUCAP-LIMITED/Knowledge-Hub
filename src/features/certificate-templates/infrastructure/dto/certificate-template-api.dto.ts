import { z } from 'zod';

/** Wire shape of `CertificateTemplateDto`, as returned by `PUT /api/app/certificate-template`. */
export const CertificateTemplateDtoSchema = z.object({
  content: z.string(),
  lastModificationTime: z.string().nullable().optional(),
});

export type CertificateTemplateDto = z.infer<typeof CertificateTemplateDtoSchema>;
