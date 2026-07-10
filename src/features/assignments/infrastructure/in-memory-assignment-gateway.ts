import type { Logger } from '@core/logger';
import { type Result, ok, err } from '@core/result';
import {
  Assignment,
  type AssignmentError,
  type AssignmentGateway,
  AssignmentNotFoundError,
  type NewAssignmentInput,
} from '../domain';
import { ASSIGNMENT_SEED } from './assignment-seed';

export interface InMemoryAssignmentGatewayDeps {
  readonly logger: Logger;
}

/** In-memory {@link AssignmentGateway} seeded from the prototype assignment list. */
export class InMemoryAssignmentGateway implements AssignmentGateway {
  private readonly logger: Logger;
  private readonly assignments: Map<string, Assignment>;
  private counter: number;

  public constructor(deps: InMemoryAssignmentGatewayDeps) {
    this.logger = deps.logger.child('assignment-gateway');
    this.assignments = new Map(
      ASSIGNMENT_SEED.map((props) => [props.id, new Assignment(props)]),
    );
    this.counter = ASSIGNMENT_SEED.length;
  }

  public list(): Promise<Result<readonly Assignment[], AssignmentError>> {
    return Promise.resolve(ok([...this.assignments.values()]));
  }

  public create(input: NewAssignmentInput): Promise<Result<Assignment, AssignmentError>> {
    this.counter += 1;
    const id = `as-${String(this.counter)}`;
    const assignment = new Assignment({
      id,
      course: input.course,
      assignee: input.assignee,
      dueDate: input.dueDate,
      status: input.status,
      progress: 0,
    });
    this.assignments.set(id, assignment);
    return Promise.resolve(ok(assignment));
  }

  public remove(id: string): Promise<Result<void, AssignmentError>> {
    if (!this.assignments.has(id)) {
      this.logger.warn('Assignment not found', { id });
      return Promise.resolve(err(new AssignmentNotFoundError(id)));
    }
    this.assignments.delete(id);
    return Promise.resolve(ok(undefined));
  }
}
