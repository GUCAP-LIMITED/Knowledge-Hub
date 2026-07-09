import { type Result, ok } from '@core/result';
import type { TeamMember, TeamError, TeamGateway } from '@features/team/domain';

/** Hand-written, fully-typed fake of the {@link TeamGateway} port. */
export class FakeTeamGateway implements TeamGateway {
  public listResult: Result<readonly TeamMember[], TeamError> = ok([]);

  public list(): Promise<Result<readonly TeamMember[], TeamError>> {
    return Promise.resolve(this.listResult);
  }
}
