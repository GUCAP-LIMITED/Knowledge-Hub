import type { Result } from '@core/result';
import type { TeamError } from '../errors/team-errors';
import type { TeamMember } from '../entities/team-member';

/**
 * Port to the team roster. The domain states the contract in its own terms (`TeamMember`); storage
 * or HTTP details live in an infrastructure implementation. Dependency Inversion seam.
 */
export interface TeamGateway {
  /** Fetch every team member (with their learning progress merged in). */
  list(): Promise<Result<readonly TeamMember[], TeamError>>;
}
