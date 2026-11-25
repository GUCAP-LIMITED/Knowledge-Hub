import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { isErr } from '@core/result';
import type { CertificateKind, CertificateTemplateRecord } from '../domain';
import { useCertificateTemplatesModule } from './use-certificate-templates-module';

export interface UpsertCertificateTemplateInput {
  readonly kind: CertificateKind;
  readonly html: string;
}

/** Save the current design's rendered HTML as the live certificate template for one content kind. */
export const useUpsertCertificateTemplate = (): UseMutationResult<
  CertificateTemplateRecord,
  Error,
  UpsertCertificateTemplateInput
> => {
  const { upsertCertificateTemplate } = useCertificateTemplatesModule();

  return useMutation({
    mutationFn: async (
      input: UpsertCertificateTemplateInput,
    ): Promise<CertificateTemplateRecord> => {
      const result = await upsertCertificateTemplate.execute(input);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};
