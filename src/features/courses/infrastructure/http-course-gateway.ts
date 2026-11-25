/* eslint-disable max-lines */
import { type HttpClient, HttpError } from '@core/http';
import type { Logger } from '@core/logger';
import { type Result, err, ok } from '@core/result';
import { z } from 'zod';
import {
  type Course,
  type CourseError,
  type CourseGateway,
  type CourseLessonInput,
  type CourseLessonMediaInput,
  type CourseMediaUploadTicket,
  CourseNotFoundError,
  CoursesUnavailableError,
  type PagedResult,
  type EnrollmentStatusDto,
  type MyLearningParams,
  type CourseCatalogParams,
  type RequestBriefUploadInput,
  type ConfirmBriefFileInput,
  type RequestSubmissionFileUploadInput,
  type ConfirmSubmissionFileInput,
  type LessonSubmissionDto,
  type CourseMediaAsset,
} from '../domain';
import { parseDurationInput } from '@features/content';
import {
  CourseRowSchema,
  MediaAssetDtoSchema,
  MediaTicketDtoSchema,
} from './dto/course-api.dto';
import { toCourse } from './course-mapper';
import { buildCourseCatalogQuery, parseCoursesResponse } from './http-course-query';

const BASE = '/api/app/course';

const difficultyToNumber = (diff: string): number => {
  if (diff === 'Advanced') return 10;
  if (diff === 'Intermediate') return 5;
  return 0;
};
// Lesson media (upload ticket + registration) is served by the shared content-media
// endpoints — they accept a courseId in place of a content id, per backend confirmation.
const MEDIA_BASE = '/api/app/content';

const resolveCourseSaveSlug = (course: Course): string =>
  course.slug && course.slug !== course.id
    ? course.slug
    : course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export interface HttpCourseGatewayDeps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

export class HttpCourseGateway implements CourseGateway {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;

  public constructor(deps: HttpCourseGatewayDeps) {
    this.httpClient = deps.httpClient;
    this.logger = deps.logger.child('course-gateway');
  }

  public async list(
    params?: CourseCatalogParams,
  ): Promise<Result<PagedResult<Course>, CourseError>> {
    return this.guard(async () => {
      const qs = buildCourseCatalogQuery(params);
      const raw = await this.httpClient.get<
        { items?: unknown[]; totalCount?: number } | unknown[]
      >(`${BASE}/catalog${qs}`);
      return parseCoursesResponse(raw);
    });
  }

  public async myLearning(
    params: MyLearningParams,
  ): Promise<Result<PagedResult<Course>, CourseError>> {
    return this.guard(async () => {
      const query = new URLSearchParams();
      query.append('skipCount', params.skipCount.toString());
      query.append('maxResultCount', params.maxResultCount.toString());

      if (params.filter) {
        query.append('filter', params.filter);
      }
      if (params.status !== undefined) {
        query.append('status', params.status.toString());
      }
      if (params.sorting) {
        query.append('sorting', params.sorting);
      }

      const raw = await this.httpClient.get<{ items: unknown[]; totalCount: number }>(
        `/api/app/my-learning/my-enrollments?${query.toString()}`,
      );

      const items = z.array(CourseRowSchema).parse(raw.items).map(toCourse);

      return {
        items,
        totalCount: raw.totalCount,
      };
    });
  }

  public async getEnrollmentStatuses(): Promise<
    Result<readonly EnrollmentStatusDto[], CourseError>
  > {
    return this.guard(async () => {
      const raw = await this.httpClient.get<unknown[]>('/api/app/enum/EnrollmentStatus');
      const schema = z.array(
        z.object({
          value: z.number(),
          name: z.string(),
          description: z.string(),
        }),
      );
      const parsed = schema.parse(raw);
      return parsed.map((item) => ({
        value: item.value,
        label: item.description || item.name,
        name: item.name,
      }));
    });
  }

  public async getById(id: string): Promise<Result<Course, CourseError>> {
    return this.guard(async () => {
      const raw = await this.httpClient.get(
        `${BASE}/${encodeURIComponent(id)}/catalog-item`,
      );
      return toCourse(CourseRowSchema.parse(raw));
    }, id);
  }

  public async markHelpful(id: string): Promise<Result<Course, CourseError>> {
    return this.guard(async () => {
      await this.httpClient.post(`${BASE}/${id}/mark-helpful`, undefined);
      const raw = await this.httpClient.get(`${BASE}/${id}/catalog-item`);
      return toCourse(CourseRowSchema.parse(raw));
    });
  }

  public async enroll(id: string): Promise<Result<Course, CourseError>> {
    return this.guard(async () => {
      const raw = await this.httpClient.post(`${BASE}/${id}/enroll`, {});
      return toCourse(CourseRowSchema.parse(raw));
    });
  }

  public async setProgress(
    id: string,
    _progress: number,
  ): Promise<Result<Course, CourseError>> {
    // Backend doesn't support setting progress explicitly per course yet in the prototype,
    // so we just return the course as-is after a mock fetch.
    return this.getById(id);
  }

  public async markLessonComplete(
    _courseId: string,
    enrollmentId: string,
    lessonId: string,
  ): Promise<Result<Course, CourseError>> {
    return this.guard(async () => {
      const raw = await this.httpClient.post(`${BASE}/mark-lesson-complete`, undefined, {
        query: { enrollmentId, lessonId },
      });
      return toCourse(CourseRowSchema.parse(raw));
    });
  }

  public async save(course: Course): Promise<Result<Course, CourseError>> {
    return this.guard(async () => {
      // The CourseAppService UpdateAsync uses PUT /api/app/course/{id}
      const raw = await this.httpClient.put(`${BASE}/${course.id}`, {
        title: course.title,
        description: course.description,
        slug: resolveCourseSaveSlug(course),
        status: 0, // Draft (or read from course if available)
        categoryId: course.categoryId,
        category: course.category,
        difficulty: difficultyToNumber(course.difficulty),
        durationSeconds: parseDurationInput(course.duration),
      });
      return toCourse(CourseRowSchema.parse(raw));
    });
  }

  public async remove(id: string): Promise<Result<void, CourseError>> {
    return this.guard(async () => {
      await this.httpClient.delete(`${BASE}/${id}`);
    });
  }

  public async addSection(
    courseId: string,
    title: string,
  ): Promise<Result<Course, CourseError>> {
    return this.guard(async () => {
      const raw = await this.httpClient.post(`${BASE}/section/${courseId}`, { title });
      return toCourse(CourseRowSchema.parse(raw));
    });
  }

  public async updateSection(
    courseId: string,
    sectionId: string,
    title: string,
  ): Promise<Result<Course, CourseError>> {
    return this.guard(async () => {
      const raw = await this.httpClient.put(
        `${BASE}/section`,
        { title },
        { query: { courseId, sectionId } },
      );
      return toCourse(CourseRowSchema.parse(raw));
    });
  }

  public async deleteSection(
    courseId: string,
    sectionId: string,
  ): Promise<Result<Course, CourseError>> {
    return this.guard(async () => {
      const raw = await this.httpClient.delete(`${BASE}/section`, {
        query: { courseId, sectionId },
      });
      return toCourse(CourseRowSchema.parse(raw));
    });
  }

  public async addLesson(
    courseId: string,
    sectionId: string,
    data: CourseLessonInput,
  ): Promise<Result<Course, CourseError>> {
    return this.guard(async () => {
      const raw = await this.httpClient.post(`${BASE}/lesson`, data, {
        query: { courseId, sectionId },
      });
      return toCourse(CourseRowSchema.parse(raw));
    });
  }

  public async updateLesson(
    courseId: string,
    sectionId: string,
    lessonId: string,
    data: CourseLessonInput,
  ): Promise<Result<Course, CourseError>> {
    return this.guard(async () => {
      const raw = await this.httpClient.put(`${BASE}/lesson`, data, {
        query: { courseId, sectionId, lessonId },
      });
      return toCourse(CourseRowSchema.parse(raw));
    });
  }

  public async deleteLesson(
    courseId: string,
    sectionId: string,
    lessonId: string,
  ): Promise<Result<Course, CourseError>> {
    return this.guard(async () => {
      const raw = await this.httpClient.delete(`${BASE}/lesson`, {
        query: { courseId, sectionId, lessonId },
      });
      return toCourse(CourseRowSchema.parse(raw));
    });
  }

  public async requestLessonMediaUpload(
    courseId: string,
    fileName: string,
    mimeType: string,
  ): Promise<Result<CourseMediaUploadTicket, CourseError>> {
    return this.guard(async () => {
      const dto = MediaTicketDtoSchema.parse(
        await this.httpClient.post(`${MEDIA_BASE}/${courseId}/request-media-upload`, {
          fileName,
          mimeType,
        }),
      );
      return {
        blobName: dto.blobName,
        uploadUrl: dto.uploadUrl ?? null,
        method: dto.method,
        headers: dto.headers,
      };
    });
  }

  public async uploadLessonMediaBlob(
    ticket: CourseMediaUploadTicket,
    file: File,
  ): Promise<Result<void, CourseError>> {
    return this.guard(async () => {
      if (ticket.uploadUrl === null) {
        this.logger.warn('Skipping blob upload — no upload URL (storage not configured)');
        return;
      }
      const response = await fetch(ticket.uploadUrl, {
        method: ticket.method,
        headers: {
          ...ticket.headers,
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });
      if (!response.ok) {
        throw new Error(`Media upload failed (${String(response.status)}).`);
      }
    });
  }

  public async registerLessonMedia(
    courseId: string,
    input: CourseLessonMediaInput,
  ): Promise<Result<{ readonly id: string }, CourseError>> {
    return this.guard(async () => {
      const dto = MediaAssetDtoSchema.parse(
        await this.httpClient.post(`${MEDIA_BASE}/${courseId}/media`, input),
      );
      return { id: dto.id };
    });
  }

  // -- Lesson Assignment & Submissions --

  public async requestBriefUpload(
    courseId: string,
    lessonId: string,
    input: RequestBriefUploadInput,
  ): Promise<Result<CourseMediaUploadTicket, CourseError>> {
    return this.guard(async () => {
      const res = await this.httpClient.post(
        `${ASSIGNMENT_BASE(courseId, lessonId)}/brief-upload-ticket`,
        input,
      );
      const ticket = MediaTicketDtoSchema.parse(res);
      return {
        blobName: ticket.blobName,
        uploadUrl: ticket.uploadUrl ?? null,
        method: ticket.method,
        headers: ticket.headers,
      };
    });
  }

  public async confirmBriefFile(
    courseId: string,
    lessonId: string,
    input: ConfirmBriefFileInput,
  ): Promise<Result<Course, CourseError>> {
    return this.guard(async () => {
      const row = CourseRowSchema.parse(
        await this.httpClient.post(
          `${ASSIGNMENT_BASE(courseId, lessonId)}/briefs`,
          input,
        ),
      );
      return toCourse(row);
    });
  }

  public async removeBriefFile(
    courseId: string,
    lessonId: string,
    mediaAssetId: string,
  ): Promise<Result<Course, CourseError>> {
    return this.guard(async () => {
      const row = CourseRowSchema.parse(
        await this.httpClient.delete(
          `${ASSIGNMENT_BASE(courseId, lessonId)}/briefs/${mediaAssetId}`,
        ),
      );
      return toCourse(row);
    });
  }

  public async getBriefFiles(
    courseId: string,
    lessonId: string,
  ): Promise<Result<readonly CourseMediaAsset[], CourseError>> {
    return this.guard(async () => {
      const res = await this.httpClient.get(
        `${ASSIGNMENT_BASE(courseId, lessonId)}/briefs`,
      );
      return z.array(MediaAssetDtoSchema).parse(res);
    });
  }

  public async getOrCreateSubmission(
    courseId: string,
    lessonId: string,
  ): Promise<Result<LessonSubmissionDto, CourseError>> {
    return this.guard(async () => {
      const res = await this.httpClient.get(
        `${ASSIGNMENT_BASE(courseId, lessonId)}/submission`,
      );
      return LessonSubmissionDtoSchema.parse(res);
    });
  }

  public async requestSubmissionFileUpload(
    courseId: string,
    lessonId: string,
    input: RequestSubmissionFileUploadInput,
  ): Promise<Result<CourseMediaUploadTicket, CourseError>> {
    return this.guard(async () => {
      const res = await this.httpClient.post(
        `${ASSIGNMENT_BASE(courseId, lessonId)}/submission/file-upload-ticket`,
        input,
      );
      const ticket = MediaTicketDtoSchema.parse(res);
      return {
        blobName: ticket.blobName,
        uploadUrl: ticket.uploadUrl ?? null,
        method: ticket.method,
        headers: ticket.headers,
      };
    });
  }

  public async confirmSubmissionFile(
    courseId: string,
    lessonId: string,
    input: ConfirmSubmissionFileInput,
  ): Promise<Result<LessonSubmissionDto, CourseError>> {
    return this.guard(async () => {
      const res = await this.httpClient.post(
        `${ASSIGNMENT_BASE(courseId, lessonId)}/submission/files`,
        input,
      );
      return LessonSubmissionDtoSchema.parse(res);
    });
  }

  public async removeSubmissionFile(
    courseId: string,
    lessonId: string,
    submissionFileId: string,
  ): Promise<Result<LessonSubmissionDto, CourseError>> {
    return this.guard(async () => {
      const res = await this.httpClient.delete(
        `${ASSIGNMENT_BASE(courseId, lessonId)}/submission/files/${submissionFileId}`,
      );
      return LessonSubmissionDtoSchema.parse(res);
    });
  }

  public async submitAndComplete(
    courseId: string,
    lessonId: string,
  ): Promise<Result<LessonSubmissionDto, CourseError>> {
    return this.guard(async () => {
      const res = await this.httpClient.post(
        `${ASSIGNMENT_BASE(courseId, lessonId)}/submission/submit`,
        {},
      );
      return LessonSubmissionDtoSchema.parse(res);
    });
  }

  /** `notFoundId` names the resource being fetched, so a 404 maps to an accurate not-found message. */
  private async guard<T>(
    fn: () => Promise<T>,
    notFoundId?: string,
  ): Promise<Result<T, CourseError>> {
    try {
      return ok(await fn());
    } catch (cause) {
      const status = cause instanceof HttpError ? cause.status : undefined;
      this.logger.error('Course request failed', cause, { status });
      if (status === 404 && notFoundId !== undefined) {
        return err(new CourseNotFoundError(notFoundId));
      }
      return err(new CoursesUnavailableError(cause));
    }
  }
}

const SubmissionFileDtoSchema = z.object({
  id: z.string(),
  originalFileName: z.string(),
  mimeType: z.string().nullable().optional(),
  sizeBytes: z.number(),
  displayOrder: z.number().optional().default(0),
  readUrl: z.string().nullable().optional(),
});

const LessonSubmissionDtoSchema = z.object({
  id: z.string(),
  lessonId: z.string(),
  enrollmentId: z.string(),
  status: z.number(),
  statusName: z.string().optional().default(''),
  submittedAt: z.string().nullable().optional(),
  files: z.array(SubmissionFileDtoSchema).optional().default([]),
});

const ASSIGNMENT_BASE = (courseId: string, lessonId: string): string =>
  `/api/app/courses/${courseId}/lessons/${lessonId}/assignment`;
