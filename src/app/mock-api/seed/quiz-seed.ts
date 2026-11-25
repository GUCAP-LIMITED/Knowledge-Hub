export interface QuizOptionSeed {
  readonly id: string;
  readonly text: string;
  readonly isCorrect: boolean;
}

export interface QuizQuestionSeed {
  readonly id: string;
  readonly prompt: string;
  readonly options: QuizOptionSeed[];
}

export interface QuizSeed {
  id: string;
  title: string;
  passingPercentage: number;
  isMultipleAttemptAllowed: boolean;
  version: number;
  questions: QuizQuestionSeed[];
}

type RawQuestion = readonly [prompt: string, options: readonly string[], correct: number];

const build = (
  id: string,
  title: string,
  passingPercentage: number,
  questions: readonly RawQuestion[],
): QuizSeed => ({
  id,
  title,
  passingPercentage,
  isMultipleAttemptAllowed: true,
  version: 1,
  questions: questions.map(([prompt, options, correct], qi) => ({
    id: `${id}-q${String(qi + 1)}`,
    prompt,
    options: options.map((text, oi) => ({
      id: `${id}-q${String(qi + 1)}-o${String(oi + 1)}`,
      text,
      isCorrect: oi === correct,
    })),
  })),
});

const onboardingQuizzes = (): QuizSeed[] => [
  build('quiz-1', 'Week-one knowledge check', 60, [
    [
      'Where do you find your assigned training?',
      ['My Learning', 'Settings', 'Reviews', 'Nowhere'],
      0,
    ],
    [
      'What unlocks a certificate for a course?',
      ['Enrolling', 'Rating it', 'Completing it', 'Sharing it'],
      2,
    ],
    [
      'Who can approve submitted content?',
      ['Anyone', 'Users with approval rights', 'Only learners', 'Nobody'],
      1,
    ],
    [
      'A mandatory course is one that learners…',
      ['Can skip', 'Must complete', 'Cannot open', 'Only admins see'],
      1,
    ],
  ]),
  build('quiz-2', 'Admissions assessment', 70, [
    [
      'What is the first step in qualifying an enquiry?',
      ['Quote a price', 'Check eligibility', 'Send a contract', 'Close the lead'],
      1,
    ],
    [
      'Which document confirms a student’s identity?',
      ['Passport', 'Utility bill', 'Reference letter', 'CV'],
      0,
    ],
    [
      'How often should leads be followed up?',
      ['Never', 'Within agreed SLAs', 'Once a year', 'Only on request'],
      1,
    ],
    [
      'An incomplete application should be…',
      ['Rejected silently', 'Returned with clear next steps', 'Deleted', 'Approved'],
      1,
    ],
    [
      'The best time to log a call is…',
      ['Next week', 'Straight after the call', 'Never', 'At month end'],
      1,
    ],
  ]),
];

const complianceQuizzes = (): QuizSeed[] => [
  build('quiz-3', 'Compliance quiz', 80, [
    [
      'Personal data may be shared…',
      [
        'With anyone',
        'Only where there is a lawful basis',
        'On social media',
        'Freely internally',
      ],
      1,
    ],
    [
      'A subject access request must be answered within…',
      ['One month', 'One year', 'Never', 'One hour'],
      0,
    ],
    [
      'If you suspect a data breach you should…',
      ['Ignore it', 'Report it immediately', 'Wait a week', 'Delete evidence'],
      1,
    ],
    [
      'Which is the safest way to share student files?',
      ['Personal email', 'Approved secure storage', 'USB stick', 'Chat app'],
      1,
    ],
  ]),
  build('quiz-4', 'Support scenarios', 60, [
    [
      'A distressed student calls. First, you…',
      ['Hang up', 'Listen and acknowledge', 'Transfer blindly', 'Email later'],
      1,
    ],
    [
      'Safeguarding concerns must be…',
      ['Kept private', 'Escalated through the agreed path', 'Posted publicly', 'Ignored'],
      1,
    ],
    ['A good case note is…', ['Vague', 'Factual and dated', 'Emotional', 'Optional'], 1],
  ]),
];

export const createQuizzes = (): QuizSeed[] => [
  ...onboardingQuizzes(),
  ...complianceQuizzes(),
];
