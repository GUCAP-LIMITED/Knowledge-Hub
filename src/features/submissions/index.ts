/**
 * Public API of the `submissions` feature — the review workflow (My Submissions + Approvals).
 * Both pages operate on the same `Submission` aggregate, so they live in ONE feature: a separate
 * `approvals` feature would have to import this feature's internals, which the boundaries forbid.
 */
export {
  createSubmissionsModule,
  type SubmissionsModule,
  type SubmissionsModuleDeps,
} from './submissions-module';
export {
  SubmissionsModuleProvider,
  useSubmissions,
  useMySubmissions,
  useSubmitContent,
  useApproveSubmission,
  useRejectSubmission,
  useFlagSubmission,
  usePublishSubmission,
  submissionsQueryKey,
} from './presentation';
export { Submission, type SubmissionProps, type SubmissionStatus } from './domain';
