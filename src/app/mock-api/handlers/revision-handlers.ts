import { findContent } from '../content-view';
import {
  can,
  normalizeQuery,
  notFound,
  paginate,
  patch,
  requireUser,
  sortBy,
} from '../mock-context';
import { nextId, type MockRevision, type MockState } from '../mock-state';
import { MockHttpFailure, type MockRequest, type MockRoute } from '../mock-types';
import { applyCurriculum, applyDetails } from './content-edit-handlers';
import { editable } from './content-handlers';

const BASE = '/api/app/content';

const OPEN: readonly number[] = [0, 5, 10, 25];

const activeFor = (state: MockState, contentId: string): MockRevision | undefined =>
  [...state.revisions]
    .reverse()
    .find((r) => r.contentItemId === contentId && OPEN.includes(r.status));

const requireActive = (state: MockState, contentId: string): MockRevision => {
  const revision = activeFor(state, contentId);
  if (revision === undefined) {
    throw notFound('Revision');
  }
  return revision;
};

const saveRevision = (state: MockState, request: MockRequest): unknown => {
  const user = requireUser(request);
  const contentId = request.params.id ?? '';
  if (findContent(state, contentId) === undefined) {
    throw notFound('Content');
  }
  const payloadJson = JSON.stringify(request.body);
  const existing = activeFor(state, contentId);
  if (existing?.status === 0) {
    patch(existing, { payloadJson, lastModificationTime: state.now.toISOString() });
    return existing;
  }
  const revision: MockRevision = {
    id: nextId(state, 'revision'),
    contentItemId: contentId,
    authorId: user.id,
    authorName: user.name,
    status: 0,
    payloadJson,
    reviewerNotes: null,
    creationTime: state.now.toISOString(),
    lastModificationTime: null,
  };
  state.revisions.push(revision);
  return revision;
};

interface DraftPayload {
  readonly details?: Parameters<typeof applyDetails>[1];
  readonly curriculum?: Parameters<typeof applyCurriculum>[2];
}

/** Applying an approved revision rewrites the live content and its catalogue entry. */
const applyToCatalog = (state: MockState, revision: MockRevision): void => {
  const payload = JSON.parse(revision.payloadJson) as DraftPayload;
  const item = editable(state, revision.contentItemId);
  if (payload.details !== undefined) {
    applyDetails(item, payload.details);
  }
  if (payload.curriculum !== undefined) {
    applyCurriculum(state, item, payload.curriculum);
  }
  const course = state.courses.find((c) => c.id === item.id);
  const tutorial = state.tutorials.find((t) => t.id === item.id);
  const resource = state.resources.find((r) => r.id === item.id);
  const live = course ?? tutorial ?? resource;
  if (live !== undefined && payload.details !== undefined) {
    Object.assign(live, {
      title: item.title,
      subtitle: item.subtitle ?? '',
      description: item.description ?? '',
    });
  }
  if (course !== undefined && payload.curriculum !== undefined) {
    Object.assign(course, { sections: item.sections });
  }
};

const review = (state: MockState, request: MockRequest, approve: boolean): unknown => {
  const user = requireUser(request);
  const permission = approve ? 'Approvals.Approve' : 'Approvals.Reject';
  if (!can(state, user, permission)) {
    throw new MockHttpFailure(403, 'You do not have permission to review revisions.');
  }
  const revision = requireActive(state, request.params.id ?? '');
  const body = request.body as { notes?: string };
  revision.status = approve ? 15 : 25;
  revision.reviewerNotes = body.notes ?? null;
  revision.lastModificationTime = state.now.toISOString();
  if (approve) {
    applyToCatalog(state, revision);
  }
  return revision;
};

const queue = (state: MockState, request: MockRequest): unknown => {
  const query = normalizeQuery(request.query);
  const needle = (query.filter ?? '').toLowerCase();
  const matches = state.revisions.filter((r) => {
    const content = findContent(state, r.contentItemId);
    return (
      r.status !== 0 &&
      (query.status === undefined || r.status === Number(query.status)) &&
      (query.type === undefined || content?.type === Number(query.type)) &&
      `${content?.title ?? ''} ${r.authorName}`.toLowerCase().includes(needle)
    );
  });
  return paginate(
    sortBy(matches, query.sorting ?? 'creationTime desc', {
      creationtime: (r) => Date.parse(r.creationTime),
    }),
    query,
  );
};

const statusCounts = (state: MockState, request: MockRequest): unknown => {
  const query = normalizeQuery(request.query);
  const scoped = state.revisions.filter(
    (r) =>
      query.type === undefined ||
      findContent(state, r.contentItemId)?.type === Number(query.type),
  );
  const n = (status: number): number => scoped.filter((r) => r.status === status).length;
  return { pending: n(5), inReview: n(10), approved: n(15), rejected: n(25) };
};

export const revisionHandlers = (state: MockState): readonly MockRoute[] => [
  { method: 'GET', pattern: `${BASE}/review-queue`, handler: (r) => queue(state, r) },
  {
    method: 'GET',
    pattern: `${BASE}/revision-status-counts`,
    handler: (r) => statusCounts(state, r),
  },
  {
    method: 'GET',
    pattern: `${BASE}/revision/:revisionId`,
    handler: ({ params }) => {
      const revision = state.revisions.find((r) => r.id === params.revisionId);
      if (revision === undefined) {
        throw notFound('Revision');
      }
      return revision;
    },
  },
  {
    method: 'GET',
    pattern: `${BASE}/:id/active-revision`,
    handler: ({ params }) => requireActive(state, params.id ?? ''),
  },
  {
    method: 'POST',
    pattern: `${BASE}/:id/save-revision`,
    handler: (r) => saveRevision(state, r),
  },
  {
    method: 'POST',
    pattern: `${BASE}/:id/submit-revision`,
    handler: ({ params }) => {
      const revision = requireActive(state, params.id ?? '');
      revision.status = 5;
      revision.lastModificationTime = state.now.toISOString();
      return revision;
    },
  },
  {
    method: 'POST',
    pattern: `${BASE}/:id/approve-revision`,
    handler: (r) => review(state, r, true),
  },
  {
    method: 'POST',
    pattern: `${BASE}/:id/reject-revision`,
    handler: (r) => review(state, r, false),
  },
];
