import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { isErr } from '@core/result';
import type { CertificateTemplateRecord } from '../domain';
import {
  useCertificateTemplateStore,
  type CertificateKind,
} from '../store/certificate-template-store';
import {
  parseCertificateTemplateHtml,
  type CertificateTemplateHtmlFormat,
} from './certificate-template-html-parser';
import { useCertificateTemplatesModule } from './use-certificate-templates-module';

export interface UseHydrateCertificateDesignResult {
  readonly isLoading: boolean;
  readonly isError: boolean;
  /** The backend has been checked and had nothing saved for this kind yet — the admin is
   * building a new template from the defaults, not editing a lost one. */
  readonly hasNoSavedTemplate: boolean;
  /** Set once the backend's template has been parsed — `legacy` means only the admin copy could
   * be recovered, so the UI should prompt for a new background upload. */
  readonly importedFormat: CertificateTemplateHtmlFormat | null;
}

/**
 * Fetches the backend's currently-saved template for one kind and, the first time it resolves,
 * either merges its recovered content/positions/styles onto the in-memory design (a template
 * existed) or simply records that none exists yet — either way, that's the *initial check*, and
 * it only ever happens once per kind per session: once done, the query is disabled so a later
 * refetch (e.g. window refocus, or right after saving a brand-new template) can never clobber
 * in-progress local edits.
 */
export const useHydrateCertificateDesign = (
  kind: CertificateKind,
): UseHydrateCertificateDesignResult => {
  const { getCertificateTemplate } = useCertificateTemplatesModule();
  const alreadyHydrated = useCertificateTemplateStore(
    (state) => state.hydratedKinds[kind],
  );
  const hydrateDesign = useCertificateTemplateStore((state) => state.hydrateDesign);

  const query = useQuery({
    queryKey: ['certificate-template', kind],
    queryFn: async (): Promise<CertificateTemplateRecord | null> => {
      const result = await getCertificateTemplate.execute(kind);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    enabled: !alreadyHydrated,
  });
  const { data } = query;

  useEffect(() => {
    if (alreadyHydrated || data === undefined) {
      return;
    }
    hydrateDesign(
      kind,
      data === null ? {} : parseCertificateTemplateHtml(data.content).design,
    );
  }, [alreadyHydrated, data, hydrateDesign, kind]);

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    hasNoSavedTemplate: !query.isLoading && !query.isError && data === null,
    importedFormat:
      data !== undefined && data !== null
        ? parseCertificateTemplateHtml(data.content).format
        : null,
  };
};
