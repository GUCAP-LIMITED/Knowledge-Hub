import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import {
  ApproveSubmissionUseCase,
  FlagSubmissionUseCase,
  ListMySubmissionsUseCase,
  ListSubmissionsUseCase,
  PublishSubmissionUseCase,
  RejectSubmissionUseCase,
  SubmitContentUseCase,
} from './application';
import { HttpSubmissionGateway } from './infrastructure';

export interface SubmissionsModuleDeps {
  readonly logger: Logger;
  readonly httpClient: HttpClient;
}

/** The use cases exposed by the submissions feature, consumed via a context provider. */
export interface SubmissionsModule {
  readonly listSubmissions: ListSubmissionsUseCase;
  readonly listMySubmissions: ListMySubmissionsUseCase;
  readonly submitContent: SubmitContentUseCase;
  readonly approveSubmission: ApproveSubmissionUseCase;
  readonly rejectSubmission: RejectSubmissionUseCase;
  readonly flagSubmission: FlagSubmissionUseCase;
  readonly publishSubmission: PublishSubmissionUseCase;
}

/** Composition root for the submissions feature: wires the Content API gateway to the use cases. */
export const createSubmissionsModule = (
  deps: SubmissionsModuleDeps,
): SubmissionsModule => {
  const submissionGateway = new HttpSubmissionGateway({
    httpClient: deps.httpClient,
    logger: deps.logger,
  });
  const shared = { submissionGateway, logger: deps.logger };

  return {
    listSubmissions: new ListSubmissionsUseCase(shared),
    listMySubmissions: new ListMySubmissionsUseCase(shared),
    submitContent: new SubmitContentUseCase(shared),
    approveSubmission: new ApproveSubmissionUseCase(shared),
    rejectSubmission: new RejectSubmissionUseCase(shared),
    flagSubmission: new FlagSubmissionUseCase(shared),
    publishSubmission: new PublishSubmissionUseCase(shared),
  };
};
