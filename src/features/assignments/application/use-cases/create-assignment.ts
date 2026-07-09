import { type Result, isErr, err } from '@core/result';
import type { Logger } from '@core/logger';
import {
  type Assignment,
  type AssignmentError,
  type AssignmentGateway,
  AssignmentTarget,
  InvalidAssignmentTargetError,
} from '../../domain';

export interface CreateAssignmentInput {
  readonly course: string;
  readonly assignee: string;
  readonly dueDate: Date;
}

export interface CreateAssignmentUseCaseDeps {
  readonly assignmentGateway: AssignmentGateway;
  readonly logger: Logger;
}

/**
 * Create a training assignment. Validates the assignee via the domain value object and requires a
 * non-empty course title; new assignments always start `active`.
 */
export class CreateAssignmentUseCase {
  private readonly assignmentGateway: AssignmentGateway;
  private readonly logger: Logger;

  public constructor(deps: CreateAssignmentUseCaseDeps) {
    this.assignmentGateway = deps.assignmentGateway;
    this.logger = deps.logger.child('create-assignment');
  }

  public async execute(
    input: CreateAssignmentInput,
  ): Promise<Result<Assignment, AssignmentError>> {
    const course = input.course.trim();
    if (course.length === 0) {
      this.logger.warn('Rejected assignment with empty course');
      return err(new InvalidAssignmentTargetError('course is required'));
    }

    const assignee = AssignmentTarget.create(input.assignee);
    if (isErr(assignee)) {
      this.logger.warn('Rejected invalid assignment target', {
        code: assignee.error.code,
      });
      return assignee;
    }

    const result = await this.assignmentGateway.create({
      course,
      assignee: assignee.value.value,
      dueDate: input.dueDate,
      status: 'active',
    });
    if (isErr(result)) {
      this.logger.warn('Creating assignment failed', { code: result.error.code });
      return result;
    }

    this.logger.info('Assignment created', { id: result.value.id });
    return result;
  }
}
