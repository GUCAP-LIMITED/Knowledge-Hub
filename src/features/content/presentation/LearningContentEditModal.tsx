import type { ReactElement } from 'react';
import { DetailsEditModal, type EditFieldConfig, type EditFieldOption } from '@shared/ui';
import { useContentCategories } from './use-content';
import type { ContentCategory } from '../domain';
import { useDifficultyOptions } from '@features/tutorials/presentation/use-tutorials';
import {
  formatDurationDisplay,
  parseDurationInput,
  validateDurationInput,
} from './duration-parser';

export interface LearningContentEditItem {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly categoryId?: string | null;
  readonly duration: string;
  readonly durationSeconds?: number;
  readonly difficulty?: string;
  readonly description?: string;
}

export interface LearningContentSavePayload {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly categoryId: string | null;
  readonly duration: string;
  readonly durationSeconds: number;
  readonly difficulty: string;
  readonly description: string;
}

export interface LearningContentEditModalProps<T extends LearningContentEditItem> {
  readonly item: T | null;
  readonly contentType: 'course' | 'tutorial';
  readonly heading: string;
  readonly isSubmitting: boolean;
  readonly onClose: () => void;
  readonly onSave: (payload: LearningContentSavePayload) => void;
}

interface SaveCategoryResult {
  readonly categoryId: string | null;
  readonly categoryName: string;
}

const resolveSaveCategory = (
  categories: readonly ContentCategory[],
  selectedValue: string,
  currentCategoryName: string,
): SaveCategoryResult => {
  const matched = categories.find(
    (c) => c.id === selectedValue || c.name.toLowerCase() === selectedValue.toLowerCase(),
  );
  if (matched !== undefined) {
    return { categoryId: matched.id, categoryName: matched.name };
  }
  const isGuid = selectedValue.length === 36;
  return {
    categoryId: isGuid ? selectedValue : null,
    categoryName: isGuid ? currentCategoryName : selectedValue,
  };
};

const resolveInitialCategoryValue = (
  categories: readonly ContentCategory[],
  item: LearningContentEditItem,
): string => {
  if (item.categoryId && categories.some((c) => c.id === item.categoryId)) {
    return item.categoryId;
  }
  const byName = categories.find(
    (c) => c.name.toLowerCase() === item.category.toLowerCase(),
  );
  if (byName) {
    return byName.id;
  }
  return item.categoryId ?? item.category;
};

const buildCategoryOptions = (
  categories: readonly ContentCategory[],
  initialValue: string,
  currentCategoryName: string,
): readonly EditFieldOption[] => {
  const options = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));
  const hasMatch = categories.some((c) => c.id === initialValue);
  if (!hasMatch && (initialValue !== '' || currentCategoryName !== '')) {
    return [
      {
        value: initialValue || currentCategoryName,
        label: currentCategoryName || 'Current Category',
      },
      ...options,
    ];
  }
  return options;
};

const resolveInitialDuration = (item: LearningContentEditItem): string => {
  if (item.duration && item.duration !== 'N/A' && item.duration !== '0m') {
    return item.duration;
  }
  if (typeof item.durationSeconds === 'number' && item.durationSeconds > 0) {
    return formatDurationDisplay(item.durationSeconds);
  }
  return '';
};

const buildLearningContentFields = (
  item: LearningContentEditItem,
  categories: readonly ContentCategory[],
  difficulties: readonly string[],
): readonly EditFieldConfig[] => {
  const initialCategory = resolveInitialCategoryValue(categories, item);
  return [
    {
      name: 'title',
      label: 'Title',
      kind: 'text',
      initial: item.title,
      required: true,
      maxLength: 200,
    },
    {
      name: 'category',
      label: 'Category',
      kind: 'select',
      initial: initialCategory,
      options: buildCategoryOptions(categories, initialCategory, item.category),
    },
    {
      name: 'duration',
      label: 'Duration',
      kind: 'duration',
      initial: resolveInitialDuration(item),
      placeholder: 'e.g. 15m, 1h 30m, 45s',
      validate: validateDurationInput,
    },
    {
      name: 'difficulty',
      label: 'Difficulty',
      kind: 'select',
      initial: item.difficulty ?? 'Beginner',
      options: difficulties,
    },
    {
      name: 'description',
      label: 'Description',
      kind: 'richtext',
      initial: item.description ?? '',
      maxLength: 4000,
    },
  ];
};

export const LearningContentEditModal = <T extends LearningContentEditItem>({
  item,
  contentType,
  heading,
  isSubmitting,
  onClose,
  onSave,
}: LearningContentEditModalProps<T>): ReactElement => {
  const isOpen = item !== null;
  const categoriesQuery = useContentCategories(contentType, {
    enabled: isOpen,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
  const categories = categoriesQuery.data ?? [];
  const difficulties = useDifficultyOptions(isOpen);

  return (
    <DetailsEditModal
      item={item === null ? null : { id: `${item.id}-${String(categories.length)}` }}
      heading={heading}
      fields={
        item === null ? [] : buildLearningContentFields(item, categories, difficulties)
      }
      isSubmitting={isSubmitting}
      onClose={onClose}
      onSave={(id, draft) => {
        const durationSeconds = parseDurationInput(draft.duration ?? '');
        const { categoryId, categoryName } = resolveSaveCategory(
          categories,
          draft.category ?? '',
          item?.category ?? '',
        );

        onSave({
          id: item?.id ?? id,
          title: (draft.title ?? '').trim(),
          category: categoryName,
          categoryId,
          duration: formatDurationDisplay(durationSeconds),
          durationSeconds,
          difficulty: draft.difficulty ?? 'Beginner',
          description: draft.description ?? '',
        });
      }}
    />
  );
};
