import { type Result, ok } from '@core/result';
import type {
  Course,
  CourseError,
  CourseGateway,
  CourseLessonInput,
  CourseLessonMediaInput,
  CourseMediaUploadTicket,
  PagedResult,
  MyLearningParams,
  EnrollmentStatusDto,
  RequestBriefUploadInput,
  ConfirmBriefFileInput,
  RequestSubmissionFileUploadInput,
  ConfirmSubmissionFileInput,
  LessonSubmissionDto,
  CourseMediaAsset,
} from '@features/courses/domain';
import { buildCourse } from '../builders/course.builder';

/** Hand-written, fully-typed fake of the {@link CourseGateway} port. */
export class FakeCourseGateway implements CourseGateway {
  public listResult: Result<PagedResult<Course>, CourseError> = ok({
    items: [],
    totalCount: 0,
  });
  public getByIdResult: Result<Course, CourseError> = ok(buildCourse());
  public setProgressResult: Result<Course, CourseError> = ok(
    buildCourse({ progress: 5 }),
  );
  public markHelpfulResult: Result<Course, CourseError> = ok(
    buildCourse({ helpfulCount: 1, isHelpful: true }),
  );

  public lastRequestedId: string | null = null;
  public lastMarkedHelpfulId: string | null = null;
  public lastSetProgress: { readonly id: string; readonly progress: number } | null =
    null;

  public list(): Promise<Result<PagedResult<Course>, CourseError>> {
    return Promise.resolve(this.listResult);
  }

  public myLearningResult: Result<PagedResult<Course>, CourseError> = ok({
    items: [],
    totalCount: 0,
  });

  public myLearning(
    _params: MyLearningParams,
  ): Promise<Result<PagedResult<Course>, CourseError>> {
    return Promise.resolve(this.myLearningResult);
  }

  public getEnrollmentStatusesResult: Result<
    readonly EnrollmentStatusDto[],
    CourseError
  > = ok([]);

  public getEnrollmentStatuses(): Promise<
    Result<readonly EnrollmentStatusDto[], CourseError>
  > {
    return Promise.resolve(this.getEnrollmentStatusesResult);
  }

  public getById(id: string): Promise<Result<Course, CourseError>> {
    this.lastRequestedId = id;
    return Promise.resolve(this.getByIdResult);
  }

  public markHelpful(id: string): Promise<Result<Course, CourseError>> {
    this.lastMarkedHelpfulId = id;
    return Promise.resolve(this.markHelpfulResult);
  }

  public enrollResult: Result<Course, CourseError> = ok(buildCourse());
  public lastEnrolledId: string | null = null;

  public enroll(id: string): Promise<Result<Course, CourseError>> {
    this.lastEnrolledId = id;
    return Promise.resolve(this.enrollResult);
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

  public markLessonComplete(
    _courseId: string,
    _enrollmentId: string,
    _lessonId: string,
  ): Promise<Result<Course, CourseError>> {
    return Promise.resolve(ok(buildCourse()));
  }

  public addSection(
    _courseId: string,
    _title: string,
  ): Promise<Result<Course, CourseError>> {
    return Promise.resolve(ok(buildCourse()));
  }

  public updateSection(
    _courseId: string,
    _sectionId: string,
    _title: string,
  ): Promise<Result<Course, CourseError>> {
    return Promise.resolve(ok(buildCourse()));
  }

  public deleteSection(
    _courseId: string,
    _sectionId: string,
  ): Promise<Result<Course, CourseError>> {
    return Promise.resolve(ok(buildCourse()));
  }

  public addLesson(
    _courseId: string,
    _sectionId: string,
    _data: CourseLessonInput,
  ): Promise<Result<Course, CourseError>> {
    return Promise.resolve(ok(buildCourse()));
  }

  public updateLesson(
    _courseId: string,
    _sectionId: string,
    _lessonId: string,
    _data: CourseLessonInput,
  ): Promise<Result<Course, CourseError>> {
    return Promise.resolve(ok(buildCourse()));
  }

  public deleteLesson(
    _courseId: string,
    _sectionId: string,
    _lessonId: string,
  ): Promise<Result<Course, CourseError>> {
    return Promise.resolve(ok(buildCourse()));
  }

  public requestLessonMediaUploadResult: Result<CourseMediaUploadTicket, CourseError> =
    ok({
      blobName: 'fake-blob',
      uploadUrl: null,
      method: 'PUT',
      headers: {},
    });

  public requestLessonMediaUpload(
    _courseId: string,
    _fileName: string,
    _mimeType: string,
  ): Promise<Result<CourseMediaUploadTicket, CourseError>> {
    return Promise.resolve(this.requestLessonMediaUploadResult);
  }

  public uploadLessonMediaBlob(
    _ticket: CourseMediaUploadTicket,
    _file: File,
  ): Promise<Result<void, CourseError>> {
    return Promise.resolve(ok(undefined));
  }

  public registerLessonMediaResult: Result<{ readonly id: string }, CourseError> = ok({
    id: 'fake-media-asset',
  });

  public registerLessonMedia(
    _courseId: string,
    _input: CourseLessonMediaInput,
  ): Promise<Result<{ readonly id: string }, CourseError>> {
    return Promise.resolve(this.registerLessonMediaResult);
  }

  public requestBriefUpload(
    _courseId: string,
    _lessonId: string,
    _input: RequestBriefUploadInput,
  ): Promise<Result<CourseMediaUploadTicket, CourseError>> {
    return Promise.resolve(this.requestLessonMediaUploadResult);
  }

  public confirmBriefFile(
    _courseId: string,
    _lessonId: string,
    _input: ConfirmBriefFileInput,
  ): Promise<Result<Course, CourseError>> {
    return Promise.resolve(ok(buildCourse()));
  }

  public removeBriefFile(
    _courseId: string,
    _lessonId: string,
    _mediaAssetId: string,
  ): Promise<Result<Course, CourseError>> {
    return Promise.resolve(ok(buildCourse()));
  }

  public getBriefFiles(
    _courseId: string,
    _lessonId: string,
  ): Promise<Result<readonly CourseMediaAsset[], CourseError>> {
    return Promise.resolve(ok([]));
  }

  public fakeSubmissionResult: LessonSubmissionDto = {
    id: 'fake-submission-id',
    lessonId: 'fake-lesson-id',
    enrollmentId: 'fake-enrollment-id',
    status: 1,
    statusName: 'Draft',
    submittedAt: null,
    files: [],
  };

  public getOrCreateSubmission(
    _courseId: string,
    _lessonId: string,
  ): Promise<Result<LessonSubmissionDto, CourseError>> {
    return Promise.resolve(ok(this.fakeSubmissionResult));
  }

  public requestSubmissionFileUpload(
    _courseId: string,
    _lessonId: string,
    _input: RequestSubmissionFileUploadInput,
  ): Promise<Result<CourseMediaUploadTicket, CourseError>> {
    return Promise.resolve(this.requestLessonMediaUploadResult);
  }

  public confirmSubmissionFile(
    _courseId: string,
    _lessonId: string,
    _input: ConfirmSubmissionFileInput,
  ): Promise<Result<LessonSubmissionDto, CourseError>> {
    return Promise.resolve(ok(this.fakeSubmissionResult));
  }

  public removeSubmissionFile(
    _courseId: string,
    _lessonId: string,
    _submissionFileId: string,
  ): Promise<Result<LessonSubmissionDto, CourseError>> {
    return Promise.resolve(ok(this.fakeSubmissionResult));
  }

  public submitAndComplete(
    _courseId: string,
    _lessonId: string,
  ): Promise<Result<LessonSubmissionDto, CourseError>> {
    return Promise.resolve(
      ok({
        ...this.fakeSubmissionResult,
        status: 5,
        statusName: 'Submitted',
      }),
    );
  }
}
