import type {
  CourseStatisticsQuery,
  RecentReviewsQuery,
  GetReviewsQuery,
  SelectableContentParams,
} from '../domain';

export const buildStatisticsQueryString = (query?: CourseStatisticsQuery): string => {
  if (!query) {
    return '';
  }
  const params = new URLSearchParams();
  if (query.topCount !== undefined) {
    params.append('topCount', query.topCount.toString());
  }
  if (query.publishedOnly !== undefined) {
    params.append('publishedOnly', query.publishedOnly.toString());
  }
  if (query.branchId) {
    params.append('branchId', query.branchId);
  }
  const qs = params.toString();
  return qs.length > 0 ? `?${qs}` : '';
};

export const buildRecentReviewsQueryString = (query?: RecentReviewsQuery): string => {
  if (!query) {
    return '';
  }
  const params = new URLSearchParams();
  const textKeys: (keyof RecentReviewsQuery)[] = [
    'sorting',
    'reviewer',
    'course',
    'courseId',
    'feedback',
    'filter',
    'branchId',
  ];
  for (const key of textKeys) {
    const val = query[key];
    if (typeof val === 'string' && val.length > 0) {
      params.append(key, val);
    }
  }
  if (query.skipCount !== undefined) {
    params.append('skipCount', query.skipCount.toString());
  }
  if (query.maxResultCount !== undefined) {
    params.append('maxResultCount', query.maxResultCount.toString());
  }
  if (query.stars !== undefined) {
    params.append('stars', query.stars.toString());
  }
  const qs = params.toString();
  return qs.length > 0 ? `?${qs}` : '';
};

export const buildReviewsQueryString = (query?: GetReviewsQuery): string => {
  if (!query) {
    return '';
  }
  const params = new URLSearchParams();
  if (query.contentType !== undefined) {
    params.append('contentType', query.contentType.toString());
  }
  if (query.contentItemId) {
    params.append('contentItemId', query.contentItemId);
  }
  if (query.skipCount !== undefined) {
    params.append('skipCount', query.skipCount.toString());
  }
  if (query.maxResultCount !== undefined) {
    params.append('maxResultCount', query.maxResultCount.toString());
  }
  if (query.sorting) {
    params.append('sorting', query.sorting);
  }
  const qs = params.toString();
  return qs.length > 0 ? `?${qs}` : '';
};

export const buildSelectableContentQueryString = (
  query?: SelectableContentParams,
): string => {
  if (!query) {
    return '';
  }
  const params = new URLSearchParams();
  if (query.filter) {
    params.append('filter', query.filter);
  }
  if (query.type !== undefined) {
    params.append('type', query.type.toString());
  }
  if (query.skipCount !== undefined) {
    params.append('skipCount', query.skipCount.toString());
  }
  if (query.maxResultCount !== undefined) {
    params.append('maxResultCount', query.maxResultCount.toString());
  }
  const qs = params.toString();
  return qs.length > 0 ? `?${qs}` : '';
};
