import type { ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { DetailsEditModal, type EditFieldConfig, type EditFieldOption } from '@shared/ui';
import type { ContentCategory } from '@features/content';
import type { Resource } from '../domain';
import type { UpdateResourceInput } from '../application';

interface CategoryOptionItem {
  readonly id: string;
  readonly name: string;
}

interface ResolvedCategory {
  readonly categoryId: string | null;
  readonly categoryName: string;
}

const toCategoryOptionItems = (
  categories: readonly ContentCategory[] | readonly string[],
): readonly CategoryOptionItem[] =>
  categories.map((c) =>
    typeof c === 'string' ? { id: c, name: c } : { id: c.id, name: c.name },
  );

const resolveInitialCategory = (
  resource: Resource,
  options: readonly CategoryOptionItem[],
): string => {
  if (resource.categoryId && options.some((c) => c.id === resource.categoryId)) {
    return resource.categoryId;
  }
  const byName = options.find(
    (c) => c.name.toLowerCase() === resource.category.toLowerCase(),
  );
  if (byName) {
    return byName.id;
  }
  return resource.categoryId ?? resource.category;
};

const buildCategoryOptions = (
  options: readonly CategoryOptionItem[],
  initialValue: string,
  currentCategoryName: string,
): readonly EditFieldOption[] => {
  const list = options.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));
  const hasMatch = options.some((c) => c.id === initialValue);
  if (!hasMatch && (initialValue !== '' || currentCategoryName !== '')) {
    return [
      {
        value: initialValue || currentCategoryName,
        label: currentCategoryName || 'Current Category',
      },
      ...list,
    ];
  }
  return list;
};

const resolveSaveCategory = (
  options: readonly CategoryOptionItem[],
  selectedValue: string,
  fallbackName: string,
): ResolvedCategory => {
  const matched = options.find(
    (c) => c.id === selectedValue || c.name.toLowerCase() === selectedValue.toLowerCase(),
  );
  if (matched !== undefined) {
    return { categoryId: matched.id, categoryName: matched.name };
  }
  const isGuid = selectedValue.length === 36;
  return {
    categoryId: isGuid ? selectedValue : null,
    categoryName: selectedValue.length > 0 ? selectedValue : fallbackName,
  };
};

const resourceFields = (
  resource: Resource,
  categories: readonly CategoryOptionItem[],
): readonly EditFieldConfig[] => {
  const initialCategory = resolveInitialCategory(resource, categories);
  return [
    {
      name: 'title',
      label: 'Title',
      kind: 'text',
      initial: resource.title,
      required: true,
      maxLength: 200,
    },
    {
      name: 'category',
      label: 'Category',
      kind: 'select',
      initial: initialCategory,
      options: buildCategoryOptions(categories, initialCategory, resource.category),
    },
    { name: 'type', label: 'Type', kind: 'text', initial: resource.type },
    {
      name: 'description',
      label: 'Description',
      kind: 'richtext',
      initial: resource.description,
      maxLength: 4000,
    },
  ];
};

export const ResourceEditModal = ({
  editing,
  categories,
  update,
  onClose,
}: {
  readonly editing: Resource | null;
  readonly categories: readonly ContentCategory[] | readonly string[];
  readonly update: UseMutationResult<Resource, Error, UpdateResourceInput>;
  readonly onClose: () => void;
}): ReactElement => {
  const categoryOptions = toCategoryOptionItems(categories);
  return (
    <DetailsEditModal
      item={
        editing === null
          ? null
          : { id: `${editing.id}-${String(categoryOptions.length)}` }
      }
      heading="Edit resource"
      description="Update the content details."
      fields={editing === null ? [] : resourceFields(editing, categoryOptions)}
      isSubmitting={update.isPending}
      onClose={onClose}
      onSave={(id, draft) => {
        const { categoryId, categoryName } = resolveSaveCategory(
          categoryOptions,
          draft.category ?? '',
          editing?.category ?? '',
        );

        update.mutate(
          {
            id: editing?.id ?? id,
            title: (draft.title ?? '').trim(),
            category: categoryName,
            categoryId,
            type: draft.type ?? '',
            description: draft.description ?? '',
          },
          { onSuccess: onClose },
        );
      }}
    />
  );
};
