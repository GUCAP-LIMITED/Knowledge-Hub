import type { CategoryName } from './categories';

export interface TutorialVideoSeed {
  readonly assetId: string;
  readonly title: string;
  readonly minutes: number;
}

export interface TutorialSeed {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly category: CategoryName;
  readonly difficulty: 0 | 5 | 10;
  /** 0 Public · 5 Team · 10 Private. */
  readonly visibility: 0 | 5 | 10;
  readonly hue: number;
  readonly createdAt: string;
  readonly helpfulCount: number;
  readonly quizId: string | null;
  readonly videos: readonly TutorialVideoSeed[];
}

const DESC =
  'Short, focused walkthroughs you can watch in one sitting. Pause, replay and mark each video complete as you go.';

const vid = (assetId: string, title: string, minutes: number): TutorialVideoSeed => ({
  assetId,
  title,
  minutes,
});

export const TUTORIAL_SEEDS: readonly TutorialSeed[] = [
  {
    id: 'tut-platform-tour',
    slug: 'academy-platform-tour',
    title: 'Academy Platform Tour',
    subtitle: 'Find your way around in ten minutes',
    description: DESC,
    category: 'Onboarding',
    difficulty: 0,
    visibility: 0,
    hue: 190,
    createdAt: '2026-01-20T09:00:00Z',
    helpfulCount: 22,
    quizId: null,
    videos: [
      vid('asset-vid-1', 'Signing in and your dashboard', 4),
      vid('asset-vid-3', 'Courses, tutorials and resources', 5),
      vid('asset-vid-6', 'Tracking your progress', 3),
    ],
  },
  {
    id: 'tut-crm-basics',
    slug: 'crm-basics-for-consultants',
    title: 'CRM Basics for Consultants',
    subtitle: 'Log every conversation the right way',
    description: DESC,
    category: 'Admissions',
    difficulty: 0,
    visibility: 0,
    hue: 220,
    createdAt: '2026-02-11T09:00:00Z',
    helpfulCount: 14,
    quizId: 'quiz-2',
    videos: [
      vid('asset-vid-2', 'Creating a lead', 6),
      vid('asset-vid-4', 'Notes and follow-ups', 7),
    ],
  },
  {
    id: 'tut-objections',
    slug: 'handling-tough-objections',
    title: 'Handling Tough Objections',
    subtitle: 'Role-play recordings with commentary',
    description: DESC,
    category: 'Sales & Communication',
    difficulty: 5,
    visibility: 5,
    hue: 24,
    createdAt: '2026-03-02T09:00:00Z',
    helpfulCount: 27,
    quizId: null,
    videos: [
      vid('asset-vid-5', 'Price objections', 8),
      vid('asset-vid-4', 'Time objections', 6),
      vid('asset-vid-2', 'Trust objections', 7),
    ],
  },
  {
    id: 'tut-gdpr-quickstart',
    slug: 'gdpr-quick-start',
    title: 'GDPR Quick Start',
    subtitle: 'Five rules you can apply today',
    description: DESC,
    category: 'Compliance',
    difficulty: 5,
    visibility: 0,
    hue: 350,
    createdAt: '2026-03-25T09:00:00Z',
    helpfulCount: 8,
    quizId: 'quiz-3',
    videos: [vid('asset-vid-3', 'The five rules', 9)],
  },
  {
    id: 'tut-support-escalation',
    slug: 'escalating-a-student-case',
    title: 'Escalating a Student Case',
    subtitle: 'Who to call and what to write down',
    description: DESC,
    category: 'Student Support',
    difficulty: 5,
    visibility: 5,
    hue: 120,
    createdAt: '2026-04-18T09:00:00Z',
    helpfulCount: 6,
    quizId: null,
    videos: [
      vid('asset-vid-6', 'Case walkthrough', 10),
      vid('asset-vid-1', 'Common pitfalls', 5),
    ],
  },
];
