import type { Result } from '@core/result';
import type { CourseError } from '../../domain/errors/course-errors';
import type { Course } from '../../domain/entities/course';
import type {
  CourseGateway,
  CourseLessonInput,
  CourseLessonMediaInput,
  CourseMediaUploadTicket,
} from '../../domain/ports/course-gateway';

export class ManageCurriculumUseCase {
  public constructor(private readonly gateway: CourseGateway) {}

  public addSection(
    courseId: string,
    title: string,
  ): Promise<Result<Course, CourseError>> {
    return this.gateway.addSection(courseId, title);
  }

  public updateSection(
    courseId: string,
    sectionId: string,
    title: string,
  ): Promise<Result<Course, CourseError>> {
    return this.gateway.updateSection(courseId, sectionId, title);
  }

  public deleteSection(
    courseId: string,
    sectionId: string,
  ): Promise<Result<Course, CourseError>> {
    return this.gateway.deleteSection(courseId, sectionId);
  }

  public addLesson(
    courseId: string,
    sectionId: string,
    data: CourseLessonInput,
  ): Promise<Result<Course, CourseError>> {
    return this.gateway.addLesson(courseId, sectionId, data);
  }

  public updateLesson(
    courseId: string,
    sectionId: string,
    lessonId: string,
    data: CourseLessonInput,
  ): Promise<Result<Course, CourseError>> {
    return this.gateway.updateLesson(courseId, sectionId, lessonId, data);
  }

  public deleteLesson(
    courseId: string,
    sectionId: string,
    lessonId: string,
  ): Promise<Result<Course, CourseError>> {
    return this.gateway.deleteLesson(courseId, sectionId, lessonId);
  }

  public requestLessonMediaUpload(
    courseId: string,
    fileName: string,
    mimeType: string,
  ): Promise<Result<CourseMediaUploadTicket, CourseError>> {
    return this.gateway.requestLessonMediaUpload(courseId, fileName, mimeType);
  }

  public uploadLessonMediaBlob(
    ticket: CourseMediaUploadTicket,
    file: File,
  ): Promise<Result<void, CourseError>> {
    return this.gateway.uploadLessonMediaBlob(ticket, file);
  }

  public registerLessonMedia(
    courseId: string,
    input: CourseLessonMediaInput,
  ): Promise<Result<{ readonly id: string }, CourseError>> {
    return this.gateway.registerLessonMedia(courseId, input);
  }
}
