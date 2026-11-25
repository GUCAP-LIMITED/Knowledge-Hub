import { categoryId } from './categories';
import type { SectionSeed } from './course-seed';

/** `ContentStatus`: 0 Draft · 5 PendingReview · 10 InReview · 15 Approved · 20 Published · 25 Rejected. */
export type ContentStatusValue = 0 | 5 | 10 | 15 | 20 | 25;

export interface MockContentItem {
  readonly id: string;
  /** 0 course · 5 tutorial · 10 resource. */
  readonly type: 0 | 5 | 10;
  title: string;
  slug: string;
  status: ContentStatusValue;
  difficulty: number;
  visibility: number;
  durationSeconds: number;
  subtitle: string | null;
  description: string | null;
  categoryId: string | null;
  topic: string | null;
  language: string | null;
  keywords: string | null;
  thumbnailAlt: string | null;
  quizId: string | null;
  tags: string[];
  branchIds: string[];
  teamIds: string[] | null;
  readonly ownerId: string;
  readonly ownerName: string;
  submittedAt: string | null;
  reviewedByName: string | null;
  reviewNote: string | null;
  readonly creationTime: string;
  sections: SectionSeed[];
  media: {
    id: string;
    slot: number;
    kind: number;
    originalFileName: string;
    mimeType: string | null;
    sizeBytes: number;
    url: string | null;
    referencedLessonId: string | null;
    displayOrder: number;
    durationSeconds: number;
  }[];
}

interface EmptyContentSpec {
  readonly id: string;
  readonly type: 0 | 5 | 10;
  readonly title: string;
  readonly owner: { readonly id: string; readonly name: string };
  readonly nowIso: string;
}

export const emptyContent = ({
  id,
  type,
  title,
  owner,
  nowIso,
}: EmptyContentSpec): MockContentItem => ({
  id,
  type,
  title,
  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  status: 0,
  difficulty: 0,
  visibility: 0,
  durationSeconds: 0,
  subtitle: null,
  description: null,
  categoryId: null,
  topic: null,
  language: 'en',
  keywords: null,
  thumbnailAlt: null,
  quizId: null,
  tags: [],
  branchIds: [],
  teamIds: null,
  ownerId: owner.id,
  ownerName: owner.name,
  submittedAt: null,
  reviewedByName: null,
  reviewNote: null,
  creationTime: nowIso,
  sections: [],
  media: [],
});

const PRIYA = { id: 'user-consultant', name: 'Priya Nair' };
const DANIEL = { id: 'user-manager', name: 'Daniel Okafor' };
const SOFIA = { id: 'user-cons-2', name: 'Sofia Alvarez' };

const daysAgo = (now: Date, days: number): string =>
  new Date(now.getTime() - days * 86_400_000).toISOString();

interface SeedSpec {
  readonly id: string;
  readonly type: 0 | 5 | 10;
  readonly title: string;
  readonly owner: { readonly id: string; readonly name: string };
  readonly status: ContentStatusValue;
  readonly daysOld: number;
  readonly patch?: Partial<MockContentItem>;
}

const seed = (now: Date, spec: SeedSpec): MockContentItem => ({
  ...emptyContent({
    id: spec.id,
    type: spec.type,
    title: spec.title,
    owner: spec.owner,
    nowIso: daysAgo(now, spec.daysOld + 1),
  }),
  status: spec.status,
  description: 'Drafted by the team for review.',
  categoryId: categoryId(spec.type, 'Admissions'),
  submittedAt: spec.status === 0 ? null : daysAgo(now, spec.daysOld),
  ...spec.patch,
});

const pendingSubmissions = (now: Date): MockContentItem[] => [
  seed(now, {
    id: 'sub-visa',
    type: 0,
    title: 'Visa Interview Preparation',
    owner: PRIYA,
    status: 5,
    daysOld: 1,
    patch: {
      durationSeconds: 3000,
      sections: [
        {
          id: 'sub-visa-s1',
          title: 'Before the interview',
          lessons: [
            {
              id: 'sub-visa-l1',
              title: 'What officers look for',
              minutes: 12,
              kind: 0,
              mediaAssetId: 'asset-vid-2',
            },
            {
              id: 'sub-visa-l2',
              title: 'Document pack',
              minutes: 8,
              kind: 5,
              mediaAssetId: 'asset-pdf-2',
            },
          ],
        },
      ],
    },
  }),
  seed(now, {
    id: 'sub-checklist',
    type: 5,
    title: 'Using the Document Checklist',
    owner: DANIEL,
    status: 10,
    daysOld: 3,
    patch: { durationSeconds: 780 },
  }),
];

const decidedSubmissions = (now: Date): MockContentItem[] => [
  seed(now, {
    id: 'sub-refund',
    type: 10,
    title: 'Refund Policy Summary',
    owner: PRIYA,
    status: 25,
    daysOld: 6,
    patch: {
      reviewedByName: 'Amelia Hart',
      reviewNote: 'Please add the 14-day cooling-off wording before resubmitting.',
    },
  }),
  seed(now, {
    id: 'sub-scholarships',
    type: 0,
    title: 'Intro to Scholarships',
    owner: DANIEL,
    status: 15,
    daysOld: 4,
    patch: {
      durationSeconds: 2400,
      reviewedByName: 'Amelia Hart',
      reviewNote: 'Approved — ready to publish.',
    },
  }),
  seed(now, {
    id: 'sub-webinar',
    type: 5,
    title: 'Hosting a Great Webinar',
    owner: SOFIA,
    status: 0,
    daysOld: 2,
  }),
  seed(now, {
    id: 'sub-onboarding-faq',
    type: 10,
    title: 'Onboarding FAQ',
    owner: PRIYA,
    status: 0,
    daysOld: 8,
  }),
];

export const createSubmissions = (now: Date): MockContentItem[] => [
  ...pendingSubmissions(now),
  ...decidedSubmissions(now),
];
