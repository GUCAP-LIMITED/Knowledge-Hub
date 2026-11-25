import type { CategoryName } from './categories';

export interface ResourceSeed {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly type: 'Document' | 'Template' | 'Guide' | 'Checklist';
  readonly category: CategoryName;
  /** 0 Public · 5 Team · 10 Private. */
  readonly visibility: 0 | 5 | 10;
  readonly hue: number;
  readonly createdAt: string;
  readonly helpfulCount: number;
  readonly primaryAssetId: string;
  readonly attachmentAssetIds: readonly string[];
}

const DESC = 'A reference you can download, print or keep open while you work.';

export const RESOURCE_SEEDS: readonly ResourceSeed[] = [
  {
    id: 'res-handbook',
    slug: 'new-starter-handbook',
    title: 'New Starter Handbook',
    subtitle: 'Everything you need in your first month',
    description: DESC,
    type: 'Guide',
    category: 'Onboarding',
    visibility: 0,
    hue: 175,
    createdAt: '2026-01-14T09:00:00Z',
    helpfulCount: 35,
    primaryAssetId: 'asset-pdf-1',
    attachmentAssetIds: ['asset-pdf-2'],
  },
  {
    id: 'res-eligibility',
    slug: 'eligibility-checklist',
    title: 'Eligibility Checklist',
    subtitle: 'Qualify an applicant in five minutes',
    description: DESC,
    type: 'Checklist',
    category: 'Admissions',
    visibility: 0,
    hue: 210,
    createdAt: '2026-02-08T09:00:00Z',
    helpfulCount: 19,
    primaryAssetId: 'asset-pdf-2',
    attachmentAssetIds: [],
  },
  {
    id: 'res-privacy-policy',
    slug: 'data-protection-policy',
    title: 'Data Protection Policy',
    subtitle: 'The full policy, version 4',
    description: DESC,
    type: 'Document',
    category: 'Compliance',
    visibility: 0,
    hue: 5,
    createdAt: '2026-02-26T09:00:00Z',
    helpfulCount: 11,
    primaryAssetId: 'asset-pdf-3',
    attachmentAssetIds: ['asset-pdf-2'],
  },
  {
    id: 'res-call-template',
    slug: 'discovery-call-template',
    title: 'Discovery Call Template',
    subtitle: 'A proven structure for first calls',
    description: DESC,
    type: 'Template',
    category: 'Sales & Communication',
    visibility: 5,
    hue: 36,
    createdAt: '2026-03-17T09:00:00Z',
    helpfulCount: 41,
    primaryAssetId: 'asset-pdf-2',
    attachmentAssetIds: [],
  },
  {
    id: 'res-escalation',
    slug: 'student-escalation-matrix',
    title: 'Student Escalation Matrix',
    subtitle: 'Who handles what, and how fast',
    description: DESC,
    type: 'Document',
    category: 'Student Support',
    visibility: 5,
    hue: 140,
    createdAt: '2026-04-09T09:00:00Z',
    helpfulCount: 13,
    primaryAssetId: 'asset-pdf-3',
    attachmentAssetIds: ['asset-pdf-1'],
  },
];
