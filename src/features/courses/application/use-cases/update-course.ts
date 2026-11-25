import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import type { Course, CourseError, CourseGateway, Difficulty } from '../../domain';

export interface UpdateCourseInput {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly categoryId?: string | null;
  readonly difficulty?: Difficulty;
  readonly duration: string;
  readonly durationSeconds?: number;
  readonly mandatory?: boolean;
  readonly description: string;
  /** New content file (data URL). Omitted/empty keeps the existing media. */
  readonly mediaUrl?: string;
  readonly thumbnailUrl?: string;
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
      existing.value.withDetails({
        title: input.title,
        category: input.category,
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
        ...(input.difficulty !== undefined ? { difficulty: input.difficulty } : {}),
        duration: input.duration,
        ...(input.durationSeconds !== undefined
          ? { durationSeconds: input.durationSeconds }
          : {}),
        ...(input.mandatory !== undefined ? { mandatory: input.mandatory } : {}),
        description: input.description,
        ...(input.mediaUrl !== undefined ? { mediaUrl: input.mediaUrl } : {}),
        ...(input.thumbnailUrl !== undefined ? { thumbnailUrl: input.thumbnailUrl } : {}),
      }),
    );
  }
}
