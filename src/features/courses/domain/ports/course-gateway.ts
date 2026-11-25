import type { Result } from '@core/result';
import type { CourseError } from '../errors/course-errors';
import type { Course, CourseMediaAsset } from '../entities/course';

export interface PagedResult<T> {
  readonly items: readonly T[];
  readonly totalCount: number;
}

export interface EnrollmentStatusDto {
  readonly value: number;
  readonly label: string;
  readonly name?: string;
}

export interface MyLearningParams {
  readonly skipCount: number;
  readonly maxResultCount: number;
  readonly filter?: string;
  readonly status?: number;
  readonly sorting?: string;
}

/** A short-lived direct-to-Azure-Blob upload ticket for attaching media to a lesson. */
export interface CourseMediaUploadTicket {
  readonly blobName: string;
  readonly uploadUrl: string | null;
  readonly method: string;
  readonly headers: Readonly<Record<string, string>>;
}

/** Registers a blob already uploaded via a {@link CourseMediaUploadTicket} as a lesson's media asset. */
export interface CourseLessonMediaInput {
  readonly slot: number;
  readonly kind: number;
  readonly originalFileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly azureBlobName: string;
}

export interface CourseLessonInput {
  readonly title: string;
  readonly durationSeconds: number;
  readonly kind?: number;
  readonly mediaAssetId?: string;
  readonly externalUrl?: string;
  readonly isPreview?: boolean;
}

export interface CourseCatalogParams {
  readonly filter?: string | undefined;
  readonly category?: string | undefined;
  readonly categoryId?: string | undefined;
  readonly status?: number | undefined;
  readonly sorting?: string | undefined;
  readonly skipCount?: number | undefined;
  readonly maxResultCount?: number | undefined;
}

/**
 * Port to the course catalog. The domain states the contract in its own terms (`Course`); storage
 * or HTTP details live in an infrastructure implementation. Dependency Inversion seam.
 */
export interface CourseGateway {
  /** Fetch courses with pagination and filters (with the current learner's progress merged in). */
  list(params?: CourseCatalogParams): Promise<Result<PagedResult<Course>, CourseError>>;

  /** Fetch only the courses the user is currently enrolled in, paginated. */
  myLearning(params: MyLearningParams): Promise<Result<PagedResult<Course>, CourseError>>;

  /** Fetch the available enrollment statuses for filtering. */
  getEnrollmentStatuses(): Promise<Result<readonly EnrollmentStatusDto[], CourseError>>;

  /** Fetch a single course by id. */
  getById(id: string): Promise<Result<Course, CourseError>>;

  /** Enroll the current user in a course by id. */
  enroll(id: string): Promise<Result<Course, CourseError>>;

  /** Persist the learner's progress for a course and return the updated course. */
  setProgress(id: string, progress: number): Promise<Result<Course, CourseError>>;

  /** Mark a specific lesson as completed for an enrollment. */
  markLessonComplete(
    courseId: string,
    enrollmentId: string,
    lessonId: string,
  ): Promise<Result<Course, CourseError>>;

  /** Persist an edited course (title/category) and return it. */
  save(course: Course): Promise<Result<Course, CourseError>>;

  /** Remove a course from the catalog by id. */
  remove(id: string): Promise<Result<void, CourseError>>;

  /** Toggle or register a helpful vote for a course. */
  markHelpful(id: string): Promise<Result<Course, CourseError>>;

  // -- Curriculum Management --

  addSection(courseId: string, title: string): Promise<Result<Course, CourseError>>;
  updateSection(
    courseId: string,
    sectionId: string,
    title: string,
  ): Promise<Result<Course, CourseError>>;
  deleteSection(
    courseId: string,
    sectionId: string,
  ): Promise<Result<Course, CourseError>>;

  addLesson(
    courseId: string,
    sectionId: string,
    data: CourseLessonInput,
  ): Promise<Result<Course, CourseError>>;
  updateLesson(
    courseId: string,
    sectionId: string,
    lessonId: string,
    data: CourseLessonInput,
  ): Promise<Result<Course, CourseError>>;
  deleteLesson(
    courseId: string,
    sectionId: string,
    lessonId: string,
  ): Promise<Result<Course, CourseError>>;

  // -- Lesson media upload (direct-to-Azure-Blob, three-step handshake) --

  requestLessonMediaUpload(
    courseId: string,
    fileName: string,
    mimeType: string,
  ): Promise<Result<CourseMediaUploadTicket, CourseError>>;
  uploadLessonMediaBlob(
    ticket: CourseMediaUploadTicket,
    file: File,
  ): Promise<Result<void, CourseError>>;
  registerLessonMedia(
    courseId: string,
    input: CourseLessonMediaInput,
  ): Promise<Result<{ readonly id: string }, CourseError>>;

  // -- Lesson Assignment & Submissions --

  requestBriefUpload(
    courseId: string,
    lessonId: string,
    input: RequestBriefUploadInput,
  ): Promise<Result<CourseMediaUploadTicket, CourseError>>;

  confirmBriefFile(
    courseId: string,
    lessonId: string,
    input: ConfirmBriefFileInput,
  ): Promise<Result<Course, CourseError>>;

  removeBriefFile(
    courseId: string,
    lessonId: string,
    mediaAssetId: string,
  ): Promise<Result<Course, CourseError>>;

  getBriefFiles(
    courseId: string,
    lessonId: string,
  ): Promise<Result<readonly CourseMediaAsset[], CourseError>>;

  getOrCreateSubmission(
    courseId: string,
    lessonId: string,
  ): Promise<Result<LessonSubmissionDto, CourseError>>;

  requestSubmissionFileUpload(
    courseId: string,
    lessonId: string,
    input: RequestSubmissionFileUploadInput,
  ): Promise<Result<CourseMediaUploadTicket, CourseError>>;

  confirmSubmissionFile(
    courseId: string,
    lessonId: string,
    input: ConfirmSubmissionFileInput,
  ): Promise<Result<LessonSubmissionDto, CourseError>>;

  removeSubmissionFile(
    courseId: string,
    lessonId: string,
    submissionFileId: string,
  ): Promise<Result<LessonSubmissionDto, CourseError>>;

  submitAndComplete(
    courseId: string,
    lessonId: string,
  ): Promise<Result<LessonSubmissionDto, CourseError>>;
}

export interface RequestBriefUploadInput {
  readonly fileName: string;
  readonly mimeType?: string | null;
}

export interface ConfirmBriefFileInput {
  readonly mediaAssetId?: string;
  readonly blobName: string;
  readonly originalFileName: string;
  readonly mimeType?: string | null;
  readonly sizeBytes: number;
  readonly lessonId: string;
}

export interface RequestSubmissionFileUploadInput {
  readonly fileName: string;
  readonly mimeType?: string | null;
}

export interface ConfirmSubmissionFileInput {
  readonly blobName: string;
  readonly originalFileName: string;
  readonly mimeType?: string | null;
  readonly sizeBytes: number;
}

export interface SubmissionFileDto {
  readonly id: string;
  readonly originalFileName: string;
  readonly mimeType?: string | null | undefined;
  readonly sizeBytes: number;
  readonly displayOrder?: number | undefined;
  readonly readUrl?: string | null | undefined;
}

export interface LessonSubmissionDto {
  readonly id: string;
  readonly lessonId: string;
  readonly enrollmentId: string;
  readonly status: number;
  readonly statusName?: string | undefined;
  readonly submittedAt?: string | null | undefined;
  readonly files: readonly SubmissionFileDto[];
}
