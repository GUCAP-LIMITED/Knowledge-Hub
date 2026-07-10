import { type Result, ok } from '@core/result';
import type { Course, CourseError, CourseGateway } from '@features/courses/domain';
import { buildCourse } from '../builders/course.builder';

/** Hand-written, fully-typed fake of the {@link CourseGateway} port. */
export class FakeCourseGateway implements CourseGateway {
  public listResult: Result<readonly Course[], CourseError> = ok([]);
  public getByIdResult: Result<Course, CourseError> = ok(buildCourse());
  public setProgressResult: Result<Course, CourseError> = ok(
    buildCourse({ progress: 5 }),
  );

  public lastRequestedId: string | null = null;
  public lastSetProgress: { readonly id: string; readonly progress: number } | null =
    null;

  public list(): Promise<Result<readonly Course[], CourseError>> {
    return Promise.resolve(this.listResult);
  }

  public getById(id: string): Promise<Result<Course, CourseError>> {
    this.lastRequestedId = id;
    return Promise.resolve(this.getByIdResult);
  }

  public setProgress(id: string, progress: number): Promise<Result<Course, CourseError>> {
    this.lastSetProgress = { id, progress };
    return Promise.resolve(this.setProgressResult);
  }

  public saved: Course[] = [];
  public removed: string[] = [];

  public save(course: Course): Promise<Result<Course, CourseError>> {
    this.saved.push(course);
    return Promise.resolve(ok(course));
  }

  public remove(id: string): Promise<Result<void, CourseError>> {
    this.removed.push(id);
    return Promise.resolve(ok(undefined));
  }
}
