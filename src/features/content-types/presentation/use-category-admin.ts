import { useToast } from '@shared/ui';
import {
  CONTENT_TYPE,
  type ContentCategory,
  useContentCategories,
  useCreateCategory,
  useDeleteCategory,
} from '@features/content';
import { type ContentKind, KIND_META } from './content-types-model';

export interface CategoryAdmin {
  readonly namesByKind: Record<ContentKind, readonly string[]>;
  readonly isLoading: boolean;
  readonly add: (kind: ContentKind, name: string) => void;
  readonly remove: (kind: ContentKind, name: string) => void;
}

/** All backend wiring for the Content Types manager: per-kind category queries + create/delete. */
export const useCategoryAdmin = (): CategoryAdmin => {
  const course = useContentCategories('course');
  const tutorial = useContentCategories('tutorial');
  const resource = useContentCategories('resource');
  const create = useCreateCategory();
  const remove = useDeleteCategory();
  const { push } = useToast();

  const byKind: Record<ContentKind, readonly ContentCategory[]> = {
    course: course.data ?? [],
    tutorial: tutorial.data ?? [],
    resource: resource.data ?? [],
  };

  const toName = (list: readonly ContentCategory[]): readonly string[] =>
    list.map((c) => c.name);

  return {
    namesByKind: {
      course: toName(byKind.course),
      tutorial: toName(byKind.tutorial),
      resource: toName(byKind.resource),
    },
    isLoading: course.isLoading || tutorial.isLoading || resource.isLoading,
    add: (kind, name) => {
      create.mutate(
        { type: CONTENT_TYPE[kind], name: name.trim() },
        {
          onSuccess: () => {
            push(
              'success',
              `Added “${name.trim()}” to ${KIND_META[kind].label} categories.`,
            );
          },
          onError: (error) => {
            push('error', error.message);
          },
        },
      );
    },
    remove: (kind, name) => {
      const id = byKind[kind].find((c) => c.name === name)?.id;
      if (id === undefined) {
        return;
      }
      remove.mutate(id, {
        onSuccess: () => {
          push('info', `Removed “${name}” from ${KIND_META[kind].label} categories.`);
        },
        onError: (error) => {
          push('error', error.message);
        },
      });
    },
  };
};
