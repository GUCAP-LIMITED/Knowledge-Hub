import { BookOpen, FolderOpen, Lightbulb } from 'lucide-react';
import { CONTENT_TYPE } from '@features/content';
import styles from './ContentSelect.module.css';

export interface TypeMeta {
  readonly label: string;
  readonly icon: typeof BookOpen;
  readonly tone: 'primary' | 'warning' | 'success';
  readonly iconClass: string;
}

const TYPE_MAP: Record<number, TypeMeta> = {
  [CONTENT_TYPE.course]: {
    label: 'Course',
    icon: BookOpen,
    tone: 'primary',
    iconClass: styles.iconCourse ?? '',
  },
  [CONTENT_TYPE.tutorial]: {
    label: 'Tutorial',
    icon: Lightbulb,
    tone: 'warning',
    iconClass: styles.iconTutorial ?? '',
  },
  [CONTENT_TYPE.resource]: {
    label: 'Resource',
    icon: FolderOpen,
    tone: 'success',
    iconClass: styles.iconResource ?? '',
  },
};

export const getTypeMeta = (type: number): TypeMeta =>
  TYPE_MAP[type] ?? {
    label: 'Content',
    icon: BookOpen,
    tone: 'primary',
    iconClass: styles.iconCourse ?? '',
  };
