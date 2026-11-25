import type { Result } from '@core/result';
import type { Course, CourseError, CourseGateway } from '../../domain';

export class MarkLessonCompleteUseCase {
  public constructor(private readonly gateway: CourseGateway) {}

  public execute(
    courseId: string,
    enrollmentId: string,
    lessonId: string,
  ): Promise<Result<Course, CourseError>> {
    return this.gateway.markLessonComplete(courseId, enrollmentId, lessonId);
  }
}
