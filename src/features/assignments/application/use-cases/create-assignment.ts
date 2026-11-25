import { type Result, isErr, err } from '@core/result';
import type { Logger } from '@core/logger';
import {
  type Assignment,
  type AssignmentError,
  type AssignmentGateway,
  AssignmentTarget,
  InvalidAssignmentTargetError,
} from '../../domain';

import type { AssigneeCategory } from '../../domain';

export interface CreateAssignmentInput {
  readonly contentItemId: string;
  readonly assignees: readonly {
    readonly category: AssigneeCategory;
    readonly targetId: string;
    readonly displayName: string;
  }[];
  readonly dueDate: Date;
}

export interface CreateAssignmentUseCaseDeps {
  readonly assignmentGateway: AssignmentGateway;
  readonly logger: Logger;
}

/**
 * Create a training assignment. Validates the assignee via the domain value object and requires a
 * non-empty content item; new assignments always start `active`.
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
    const contentItemId = input.contentItemId.trim();
    if (contentItemId.length === 0) {
      this.logger.warn('Rejected assignment with empty content item');
      return err(new InvalidAssignmentTargetError('content item is required'));
    }

    if (input.assignees.length === 0) {
      this.logger.warn('Rejected assignment with zero assignees');
      return err(new InvalidAssignmentTargetError('at least one assignee is required'));
    }

    const validatedAssignees: {
      category: AssigneeCategory;
      targetId: string;
      displayName: string;
    }[] = [];
    for (const assigneeInput of input.assignees) {
      const target = AssignmentTarget.create(assigneeInput.targetId);
      if (isErr(target)) {
        this.logger.warn('Rejected invalid assignment target', {
          code: target.error.code,
        });
        return target;
      }
      validatedAssignees.push({
        category: assigneeInput.category,
        targetId: target.value.value,
        displayName: assigneeInput.displayName.trim(),
      });
    }

    const result = await this.assignmentGateway.create({
      contentItemId,
      assignees: validatedAssignees,
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
