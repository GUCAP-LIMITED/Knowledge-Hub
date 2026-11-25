import { z } from 'zod';
import { type Course, type CourseCatalogParams, type PagedResult } from '../domain';
import { CourseRowSchema } from './dto/course-api.dto';
import { toCourse } from './course-mapper';

export const buildCourseCatalogQuery = (params?: CourseCatalogParams): string => {
  if (!params) return '';
  const query = new URLSearchParams();
  if (params.skipCount !== undefined) {
    query.set('skipCount', String(params.skipCount));
  }
  if (params.maxResultCount !== undefined) {
    query.set('maxResultCount', String(params.maxResultCount));
  }
  if (params.filter) {
    query.set('filter', params.filter);
  }
  if (params.categoryId) {
    query.set('categoryId', params.categoryId);
  } else if (params.category && params.category !== 'all') {
    query.set('category', params.category);
  }
  if (params.status !== undefined) {
    query.set('status', String(params.status));
  }
  if (params.sorting) {
    query.set('sorting', params.sorting);
  }
  const qs = query.toString();
  return qs ? `?${qs}` : '';
};

export const parseCoursesResponse = (
  raw: { items?: unknown[]; totalCount?: number } | unknown[],
): PagedResult<Course> => {
  if (Array.isArray(raw)) {
    const items = z.array(CourseRowSchema).parse(raw).map(toCourse);
    return { items, totalCount: items.length };
  }
  const rawItems = raw.items ?? [];
  const items = z.array(CourseRowSchema).parse(rawItems).map(toCourse);
  const totalCount = typeof raw.totalCount === 'number' ? raw.totalCount : items.length;
  return { items, totalCount };
};
