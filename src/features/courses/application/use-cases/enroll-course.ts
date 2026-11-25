import type { Result } from '@core/result';
import type { Course, CourseError, CourseGateway } from '../../domain';

export class EnrollCourseUseCase {
  public constructor(private readonly gateway: CourseGateway) {}

  public execute(id: string): Promise<Result<Course, CourseError>> {
    return this.gateway.enroll(id);
  }
}
