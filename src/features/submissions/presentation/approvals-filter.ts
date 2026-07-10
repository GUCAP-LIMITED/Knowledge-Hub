import type { Submission } from '../domain';

/** Unique content types present in the queue, for the type filter. */
export const submissionTypes = (data: readonly Submission[]): readonly string[] => [
  ...new Set(data.map((s) => s.type)),
];

/** Filter the queue by a title/submitter query and a content type. */
export const filterSubmissions = (
  data: readonly Submission[],
  query: string,
  type: string,
): readonly Submission[] => {
  const q = query.trim().toLowerCase();
  return data.filter(
    (s) =>
      (type === 'all' || s.type === type) &&
      (q === '' ||
        s.title.toLowerCase().includes(q) ||
        s.submittedBy.toLowerCase().includes(q)),
  );
};
