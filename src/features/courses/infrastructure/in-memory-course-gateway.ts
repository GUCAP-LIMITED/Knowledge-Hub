import type { Logger } from '@core/logger';
import { type Result, ok, err } from '@core/result';
import {
  Course,
  type CourseError,
  type CourseGateway,
  CourseNotFoundError,
} from '../domain';
import { COURSE_SEED } from './course-seed';

export interface InMemoryCourseGatewayDeps {
  readonly logger: Logger;
}

/**
 * In-memory implementation of {@link CourseGateway}, seeded from the prototype catalog. A legitimate
 * infrastructure adapter (storage, not network) — it keeps the app a working prototype with no
 * backend while honouring the port contract. Replace with an HTTP adapter to go live.
 */
export class InMemoryCourseGateway implements CourseGateway {
  private readonly logger: Logger;
  private readonly courses: Map<string, Course>;

  public constructor(deps: InMemoryCourseGatewayDeps) {
    this.logger = deps.logger.child('course-gateway');
    this.courses = new Map(COURSE_SEED.map((props) => [props.id, new Course(props)]));
  }

  public list(): Promise<Result<readonly Course[], CourseError>> {
    return Promise.resolve(ok([...this.courses.values()]));
  }

  public getById(id: string): Promise<Result<Course, CourseError>> {
    const course = this.courses.get(id);
    if (course === undefined) {
      this.logger.warn('Course not found', { id });
      return Promise.resolve(err(new CourseNotFoundError(id)));
    }
    return Promise.resolve(ok(course));
  }

  public setProgress(id: string, progress: number): Promise<Result<Course, CourseError>> {
    const course = this.courses.get(id);
    if (course === undefined) {
      return Promise.resolve(err(new CourseNotFoundError(id)));
    }
    const updated = course.withProgress(progress);
    this.courses.set(id, updated);
    return Promise.resolve(ok(updated));
  }
}
