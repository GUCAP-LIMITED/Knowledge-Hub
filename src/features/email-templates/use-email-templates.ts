import {
  type UseMutationResult,
  type UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  CreateEmailTemplateInput,
  EmailTemplate,
  GetEmailTemplatesFilter,
  UpdateEmailTemplateInput,
} from './types';
import { useEmailTemplatesModule } from './email-templates-module';

export const emailTemplateKeys = {
  all: ['email-templates'] as const,
  list: (filter?: GetEmailTemplatesFilter) =>
    ['email-templates', 'list', filter] as const,
  detail: (id: string) => ['email-templates', 'detail', id] as const,
};

export const useEmailTemplates = (
  filter?: GetEmailTemplatesFilter,
): UseQueryResult<readonly EmailTemplate[]> => {
  const { gateway } = useEmailTemplatesModule();
  return useQuery({
    queryKey: emailTemplateKeys.list(filter),
    queryFn: async () => {
      const result = await gateway.getList(filter);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
  });
};

const useInvalidateEmailTemplates = (): (() => void) => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: emailTemplateKeys.all });
  };
};

export const useCreateEmailTemplate = (): UseMutationResult<
  EmailTemplate,
  Error,
  CreateEmailTemplateInput
> => {
  const { gateway } = useEmailTemplatesModule();
  const invalidate = useInvalidateEmailTemplates();
  return useMutation({
    mutationFn: async (input: CreateEmailTemplateInput) => {
      const result = await gateway.create(input);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: invalidate,
  });
};

export const useUpdateEmailTemplate = (): UseMutationResult<
  EmailTemplate,
  Error,
  { readonly id: string; readonly input: UpdateEmailTemplateInput }
> => {
  const { gateway } = useEmailTemplatesModule();
  const invalidate = useInvalidateEmailTemplates();
  return useMutation({
    mutationFn: async ({ id, input }) => {
      const result = await gateway.update(id, input);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: invalidate,
  });
};

export const useSetTemplateActive = (): UseMutationResult<
  EmailTemplate,
  Error,
  { readonly id: string; readonly isActive: boolean }
> => {
  const { gateway } = useEmailTemplatesModule();
  const invalidate = useInvalidateEmailTemplates();
  return useMutation({
    mutationFn: async ({ id, isActive }) => {
      const result = await gateway.setActive(id, isActive);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: invalidate,
  });
};

export const useDeleteEmailTemplate = (): UseMutationResult<void, Error, string> => {
  const { gateway } = useEmailTemplatesModule();
  const invalidate = useInvalidateEmailTemplates();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await gateway.delete(id);
      if (!result.ok) {
        throw result.error;
      }
    },
    onSuccess: invalidate,
  });
};
