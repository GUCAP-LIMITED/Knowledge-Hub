import type { QuizProps } from '../domain';

/**
 * Prototype quizzes seeded for a couple of catalog courses. Keeps the feature demoable with no
 * backend; admins can author more from the course page.
 */
export const QUIZ_SEED: readonly QuizProps[] = [
  {
    id: 'quiz-course-1',
    contentId: 'course-1',
    contentKind: 'course',
    title: 'Knowledge check',
    passMark: 60,
    questions: [
      {
        id: 'q1',
        prompt: 'What should you always do before publishing content?',
        options: [
          'Nothing',
          'Submit it for review',
          'Delete the draft',
          'Email everyone',
        ],
        correctIndex: 1,
      },
      {
        id: 'q2',
        prompt: 'Where do learners find their completed certificates?',
        options: [
          'The Reviews page',
          'The Certificates page',
          'Their inbox only',
          'Nowhere',
        ],
        correctIndex: 1,
      },
      {
        id: 'q3',
        prompt: 'A mandatory course is one that learners…',
        options: ['Can skip', 'Must complete', 'Cannot open', 'Only admins see'],
        correctIndex: 1,
      },
      {
        id: 'q4',
        prompt: 'What unlocks a certificate for a course?',
        options: ['Enrolling', 'Rating it', 'Completing it', 'Sharing it'],
        correctIndex: 2,
      },
      {
        id: 'q5',
        prompt: 'Who can author quizzes for a course?',
        options: ['Any learner', 'Admins', 'Nobody', 'Guests'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'quiz-course-2',
    contentId: 'course-2',
    contentKind: 'course',
    title: 'Quick quiz',
    passMark: 50,
    questions: [
      {
        id: 'q1',
        prompt: 'The secondary brand colour is used as an…',
        options: ['Error state', 'Accent', 'Background', 'Border only'],
        correctIndex: 1,
      },
      {
        id: 'q2',
        prompt: 'If you fail a quiz you can…',
        options: [
          'Never retry',
          'Re-watch or retake',
          'Only wait a week',
          'Contact support',
        ],
        correctIndex: 1,
      },
    ],
  },
];
