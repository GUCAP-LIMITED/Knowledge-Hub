import {
  ReadOutlined,
  BulbOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import { typeAccent } from './theme.js';

/**
 * The three creation tracks. Choosing one reconfigures the entire wizard:
 * which steps appear, what uploads are allowed, and how the learner preview
 * renders. This object is the single source of truth for that branching so no
 * step has to special-case content type inline.
 */
export const CONTENT_TYPES = [
  {
    key: 'course',
    label: 'Course',
    icon: ReadOutlined,
    accent: typeAccent.course,
    tagline: 'Best for structured, multi-lesson learning',
    bullets: [
      'Multiple lessons & sections',
      'Full curriculum builder',
      'Completion tracking',
      'Certificate eligible',
    ],
    // Steps rendered for this type, in order.
    steps: ['type', 'upload', 'details', 'curriculum', 'preview'],
    upload: {
      multiple: true,
      // Named upload slots shown as distinct cards.
      slots: [
        { id: 'thumbnail', label: 'Course thumbnail', accept: 'image', single: true, required: true, hint: '16:9 recommended, min 1280×720' },
        { id: 'intro', label: 'Intro / promo video', accept: 'video', single: true, hint: 'Short trailer shown on the course page' },
        { id: 'lessons', label: 'Lesson videos & files', accept: 'any', hint: 'Add all lesson media — you’ll arrange them into the curriculum next' },
        { id: 'resources', label: 'Supporting resources', accept: 'doc', hint: 'PDFs, slides, worksheets learners can download' },
      ],
      maxSizeMB: 5000,
    },
  },
  {
    key: 'tutorial',
    label: 'Tutorial',
    icon: BulbOutlined,
    accent: typeAccent.tutorial,
    tagline: 'Short, single-lesson, usually video',
    bullets: [
      'One focused lesson',
      'Quick to publish',
      'Great for how-tos',
      'No curriculum needed',
    ],
    steps: ['type', 'upload', 'details', 'preview'],
    upload: {
      multiple: false,
      // Exactly one primary asset — video OR pdf OR document.
      slots: [
        { id: 'primary', label: 'Tutorial content', accept: 'single-lesson', single: true, required: true, hint: 'One video, PDF, or document' },
      ],
      maxSizeMB: 2000,
    },
  },
  {
    key: 'resource',
    label: 'Resource',
    icon: FolderOpenOutlined,
    accent: typeAccent.resource,
    tagline: 'Reference material & downloads',
    bullets: [
      'PDF · DOCX · PPTX · XLSX',
      'ZIP & images',
      'External links',
      'Instant to share',
    ],
    steps: ['type', 'upload', 'details', 'preview'],
    upload: {
      multiple: true,
      allowUrl: true,
      reorder: true,
      slots: [
        { id: 'files', label: 'Reference files', accept: 'resource', hint: 'Drag to reorder — the first file is the primary one learners see' },
      ],
      maxSizeMB: 2000,
    },
  },
];

export const getType = (key) => CONTENT_TYPES.find((t) => t.key === key);

/** Human labels for each wizard step, per content type where it differs. */
export const STEP_META = {
  type: { title: 'Content type', subtitle: 'What are you creating?' },
  upload: { title: 'Upload content', subtitle: 'Add your media & files' },
  details: { title: 'Details', subtitle: 'Title, description & metadata' },
  curriculum: { title: 'Curriculum', subtitle: 'Structure sections & lessons' },
  preview: { title: 'Preview & publish', subtitle: 'Exactly what learners will see' },
};

/** Accept-string → file matching, mirrored from the existing upload validator. */
export const ACCEPT_MAP = {
  image: '.png,.jpg,.jpeg,.webp,.gif,.svg',
  video: '.mp4,.mov,.webm,.m4v',
  doc: '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx',
  resource: '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.png,.jpg,.jpeg',
  'single-lesson': '.mp4,.mov,.webm,.pdf,.doc,.docx',
  any: '.mp4,.mov,.webm,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.zip',
};

/** Category / topic / difficulty option sets (kept aligned with existing data). */
export const CATEGORIES = [
  'Onboarding', 'Compliance', 'Sales', 'Marketing', 'Product', 'Operations', 'Leadership', 'Technical', 'Other',
];
export const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
export const LANGUAGES = ['English', 'Bengali', 'Hindi', 'Arabic', 'Spanish'];
export const LESSON_KINDS = [
  { key: 'video', label: 'Video' },
  { key: 'pdf', label: 'PDF' },
  { key: 'quiz', label: 'Quiz' },
  { key: 'assignment', label: 'Assignment' },
  { key: 'link', label: 'External link' },
  { key: 'download', label: 'Download' },
];
