import { useMyPermissions } from '@features/permissions';

/**
 * Backend permission that lets a user's own uploads skip the review queue and publish immediately
 * (`ContentAppService.SubmitAsync`). Distinct from `Approvals.Publish` (acting on others' content).
 */
const PUBLISH_WITHOUT_REVIEW = 'Submissions.PublishWithoutReview';

/**
 * True when the signed-in user may publish their own content directly, per their effective
 * permission map (`GET /api/app/my/permissions`) — the same source the backend authorizes against,
 * so the wizard's messaging matches what actually happens on submit.
 */
export const usePublishesDirectly = (): boolean => {
  const { data } = useMyPermissions();
  return data?.[PUBLISH_WITHOUT_REVIEW] === true;
};
