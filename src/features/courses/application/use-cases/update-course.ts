import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import type { Course, CourseError, CourseGateway } from '../../domain';

export interface UpdateCourseInput {
  readonly id: string;
  readonly title: string;
  readonly category: string;
}

export interface UpdateCourseUseCaseDeps {
  readonly courseGateway: CourseGateway;
  readonly logger: Logger;
}

/** Edit a course's title + category (admin content management, in-place in the catalog). */
export class UpdateCourseUseCase {
  private readonly courseGateway: CourseGateway;
  private readonly logger: Logger;

  public constructor(deps: UpdateCourseUseCaseDeps) {
    this.courseGateway = deps.courseGateway;
    this.logger = deps.logger.child('update-course');
  }

  public async execute(input: UpdateCourseInput): Promise<Result<Course, CourseError>> {
    const existing = await this.courseGateway.getById(input.id);
    if (isErr(existing)) {
      this.logger.warn('Course not found for update', { id: input.id });
      return existing;
    }
    return this.courseGateway.save(
      existing.value.withDetails(input.title, input.category),
    );
  }
}
