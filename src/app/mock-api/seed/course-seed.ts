import { categoryId, type CategoryName } from './categories';

export interface LessonSeed {
  readonly id: string;
  readonly title: string;
  readonly minutes: number;
  /** Backend `LessonKind`: 0 video · 5 pdf · 10 quiz · 15 assignment · 20 link. */
  readonly kind: 0 | 5 | 10 | 15 | 20;
  readonly mediaAssetId?: string;
  readonly quizId?: string;
  readonly externalUrl?: string;
  readonly isPreview?: boolean;
}

export interface SectionSeed {
  readonly id: string;
  readonly title: string;
  readonly lessons: readonly LessonSeed[];
}

export interface CourseSeed {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly category: CategoryName;
  readonly difficulty: 0 | 5 | 10;
  readonly mandatory: boolean;
  readonly hue: number;
  readonly createdAt: string;
  readonly enrollmentCount: number;
  readonly helpfulCount: number;
  readonly introAssetId: string | null;
  readonly sections: readonly SectionSeed[];
}

export const courseCategoryId = (course: CourseSeed): string =>
  categoryId(0, course.category);

const v = (id: string, title: string, minutes: number, asset: string): LessonSeed => ({
  id,
  title,
  minutes,
  kind: 0,
  mediaAssetId: asset,
});
const doc = (id: string, title: string, minutes: number, asset: string): LessonSeed => ({
  id,
  title,
  minutes,
  kind: 5,
  mediaAssetId: asset,
});
const quiz = (id: string, title: string, quizId: string): LessonSeed => ({
  id,
  title,
  minutes: 10,
  kind: 10,
  quizId,
});
const link = (id: string, title: string, url: string): LessonSeed => ({
  id,
  title,
  minutes: 5,
  kind: 20,
  externalUrl: url,
});

const sec = (id: string, title: string, lessons: readonly LessonSeed[]): SectionSeed => ({
  id,
  title,
  lessons,
});

const LOREM =
  'A practical, hands-on programme built for UAPP consultants. Each module combines short videos, reference material and a knowledge check so you can apply what you learn straight away.';

export const COURSE_SEEDS: readonly CourseSeed[] = [
  {
    id: 'course-welcome',
    slug: 'welcome-to-uapp',
    title: 'Welcome to UAPP',
    subtitle: 'Your first week: tools, teams and ways of working',
    description: LOREM,
    category: 'Onboarding',
    difficulty: 0,
    mandatory: true,
    hue: 178,
    createdAt: '2026-01-12T09:00:00Z',
    enrollmentCount: 118,
    helpfulCount: 31,
    introAssetId: 'asset-vid-1',
    sections: [
      sec('sec-welcome-1', 'Getting started', [
        { ...v('les-w-1', 'A warm welcome', 6, 'asset-vid-1'), isPreview: true },
        v('les-w-2', 'How UAPP is organised', 9, 'asset-vid-2'),
        doc('les-w-3', 'New starter handbook', 15, 'asset-pdf-1'),
      ]),
      sec('sec-welcome-2', 'Your tools', [
        v('les-w-4', 'The Academy platform tour', 8, 'asset-vid-3'),
        link('les-w-5', 'Explore the staff intranet', 'https://www.uapp.uk'),
        quiz('les-w-6', 'Week-one knowledge check', 'quiz-1'),
      ]),
    ],
  },
  {
    id: 'course-admissions',
    slug: 'admissions-fundamentals',
    title: 'Admissions Fundamentals',
    subtitle: 'From first enquiry to confirmed enrolment',
    description: LOREM,
    category: 'Admissions',
    difficulty: 0,
    mandatory: true,
    hue: 205,
    createdAt: '2026-02-03T09:00:00Z',
    enrollmentCount: 96,
    helpfulCount: 24,
    introAssetId: 'asset-vid-2',
    sections: [
      sec('sec-adm-1', 'The student journey', [
        {
          ...v('les-a-1', 'Understanding the pipeline', 11, 'asset-vid-1'),
          isPreview: true,
        },
        v('les-a-2', 'Qualifying an enquiry', 14, 'asset-vid-2'),
        doc('les-a-3', 'Eligibility checklist', 10, 'asset-pdf-2'),
      ]),
      sec('sec-adm-2', 'Applications', [
        v('les-a-4', 'Completing an application', 16, 'asset-vid-3'),
        v('les-a-5', 'Common mistakes', 12, 'asset-vid-4'),
        quiz('les-a-6', 'Admissions assessment', 'quiz-2'),
      ]),
    ],
  },
  {
    id: 'course-compliance',
    slug: 'data-protection-and-compliance',
    title: 'Data Protection & Compliance',
    subtitle: 'Handle student data safely and lawfully',
    description: LOREM,
    category: 'Compliance',
    difficulty: 5,
    mandatory: true,
    hue: 8,
    createdAt: '2026-02-20T09:00:00Z',
    enrollmentCount: 141,
    helpfulCount: 19,
    introAssetId: 'asset-vid-4',
    sections: [
      sec('sec-comp-1', 'Principles', [
        v('les-c-1', 'Why data protection matters', 8, 'asset-vid-2'),
        doc('les-c-2', 'Policy summary', 12, 'asset-pdf-3'),
      ]),
      sec('sec-comp-2', 'In practice', [
        v('les-c-3', 'Handling subject requests', 13, 'asset-vid-5'),
        quiz('les-c-4', 'Compliance quiz', 'quiz-3'),
      ]),
    ],
  },
  {
    id: 'course-communication',
    slug: 'consultative-communication',
    title: 'Consultative Communication',
    subtitle: 'Listen first, advise second',
    description: LOREM,
    category: 'Sales & Communication',
    difficulty: 5,
    mandatory: false,
    hue: 32,
    createdAt: '2026-03-09T09:00:00Z',
    enrollmentCount: 88,
    helpfulCount: 40,
    introAssetId: 'asset-vid-3',
    sections: [
      sec('sec-com-1', 'Foundations', [
        {
          ...v('les-m-1', 'The consultative mindset', 10, 'asset-vid-1'),
          isPreview: true,
        },
        v('les-m-2', 'Asking better questions', 15, 'asset-vid-4'),
      ]),
      sec('sec-com-2', 'Conversations that convert', [
        v('les-m-3', 'Handling objections', 18, 'asset-vid-5'),
        v('les-m-4', 'Closing with confidence', 14, 'asset-vid-6'),
        doc('les-m-5', 'Call framework template', 8, 'asset-pdf-2'),
      ]),
    ],
  },
  {
    id: 'course-support',
    slug: 'student-support-essentials',
    title: 'Student Support Essentials',
    subtitle: 'Care that keeps students on track',
    description: LOREM,
    category: 'Student Support',
    difficulty: 0,
    mandatory: false,
    hue: 140,
    createdAt: '2026-03-28T09:00:00Z',
    enrollmentCount: 73,
    helpfulCount: 17,
    introAssetId: null,
    sections: [
      sec('sec-sup-1', 'Supporting students', [
        v('les-s-1', 'Recognising when help is needed', 9, 'asset-vid-2'),
        v('les-s-2', 'Escalation paths', 11, 'asset-vid-3'),
        quiz('les-s-3', 'Support scenarios', 'quiz-4'),
      ]),
    ],
  },
  {
    id: 'course-advanced-admissions',
    slug: 'advanced-admissions-strategy',
    title: 'Advanced Admissions Strategy',
    subtitle: 'Complex cases, competitive programmes and appeals',
    description: LOREM,
    category: 'Admissions',
    difficulty: 10,
    mandatory: false,
    hue: 262,
    createdAt: '2026-04-15T09:00:00Z',
    enrollmentCount: 41,
    helpfulCount: 9,
    introAssetId: 'asset-vid-5',
    sections: [
      sec('sec-adv-1', 'Complex cases', [
        v('les-v-1', 'Non-standard qualifications', 17, 'asset-vid-4'),
        v('les-v-2', 'Competitive programmes', 19, 'asset-vid-5'),
        { id: 'les-v-3', title: 'Appeal case study', minutes: 20, kind: 15 },
      ]),
    ],
  },
  {
    id: 'course-onboarding-remote',
    slug: 'working-remotely-at-uapp',
    title: 'Working Remotely at UAPP',
    subtitle: 'Stay connected, focused and well',
    description: LOREM,
    category: 'Onboarding',
    difficulty: 0,
    mandatory: false,
    hue: 292,
    createdAt: '2026-05-06T09:00:00Z',
    enrollmentCount: 64,
    helpfulCount: 12,
    introAssetId: 'asset-vid-6',
    sections: [
      sec('sec-rem-1', 'Remote essentials', [
        v('les-r-1', 'Setting up your workspace', 7, 'asset-vid-6'),
        doc('les-r-2', 'Remote working guide', 10, 'asset-pdf-1'),
      ]),
    ],
  },
];
