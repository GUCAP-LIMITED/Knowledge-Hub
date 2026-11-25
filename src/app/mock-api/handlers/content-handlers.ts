import { catalogRefs } from '../content-index';
import { catalogAsContent, findContent, toDetailDto, toListRow } from '../content-view';
import { publishToCatalog } from '../content-publish';
import {
  can,
  normalizeQuery,
  notFound,
  paginate,
  requireUser,
  sortBy,
} from '../mock-context';
import { nextId, type MockState } from '../mock-state';
import { MockHttpFailure, type MockRequest, type MockRoute } from '../mock-types';
import type { MockUser } from '../seed/mock-users';
import {
  emptyContent,
  type ContentStatusValue,
  type MockContentItem,
} from '../seed/submission-seed';

const BASE = '/api/app/content';

const requireContent = (state: MockState, id: string): MockContentItem => {
  const item = findContent(state, id);
  if (item === undefined) {
    throw notFound('Content');
  }
  return item;
};

/** Writes need a stored record: the first edit of a catalogue item copies it into `submissions`. */
const editable = (state: MockState, id: string): MockContentItem => {
  const stored = state.submissions.find((s) => s.id === id);
  if (stored !== undefined) {
    return stored;
  }
  const item = requireContent(state, id);
  state.submissions.push(item);
  return item;
};

const allItems = (state: MockState, user: MockUser): MockContentItem[] => {
  const catalog = catalogRefs(state)
    .filter((ref) => !state.submissions.some((s) => s.id === ref.id))
    .flatMap((ref) => catalogAsContent(state, ref.id) ?? []);
  const everything = [...state.submissions, ...catalog];
  return can(state, user, 'Approvals.View')
    ? everything
    : everything.filter((i) => i.ownerId === user.id);
};

const SORTERS = {
  title: (i: MockContentItem): string => i.title,
  creationtime: (i: MockContentItem): number => Date.parse(i.creationTime),
  submittedat: (i: MockContentItem): number =>
    Date.parse(i.submittedAt ?? i.creationTime),
} as const;

const list = (state: MockState, request: MockRequest): unknown => {
  const user = requireUser(request);
  const query = normalizeQuery(request.query);
  const needle = (query.filter ?? '').toLowerCase();
  const matches = allItems(state, user).filter(
    (i) =>
      (query.status === undefined || i.status === Number(query.status)) &&
      (query.type === undefined || i.type === Number(query.type)) &&
      (query.categoryid === undefined || i.categoryId === query.categoryid) &&
      `${i.title} ${i.ownerName}`.toLowerCase().includes(needle),
  );
  const page = paginate(
    sortBy(matches, query.sorting ?? 'creationTime desc', SORTERS),
    query,
  );
  return {
    totalCount: page.totalCount,
    items: page.items.map((i) => toListRow(state, user, i)),
  };
};

const counts = (state: MockState, request: MockRequest): unknown => {
  const user = requireUser(request);
  const query = normalizeQuery(request.query);
  const needle = (query.filter ?? '').toLowerCase();
  const scoped = allItems(state, user).filter(
    (i) =>
      (query.type === undefined || i.type === Number(query.type)) &&
      `${i.title} ${i.ownerName}`.toLowerCase().includes(needle),
  );
  const n = (status: number): number => scoped.filter((i) => i.status === status).length;
  return {
    pending: n(5),
    inReview: n(10),
    approved: n(15),
    published: n(20),
    rejected: n(25),
  };
};

const create = (state: MockState, request: MockRequest): unknown => {
  const user = requireUser(request);
  const body = request.body as {
    type: 0 | 5 | 10;
    title: string;
    branchIds?: string[] | null;
  };
  const item = emptyContent({
    id: nextId(state, 'content'),
    type: body.type,
    title: body.title,
    owner: user,
    nowIso: state.now.toISOString(),
  });
  item.branchIds = body.branchIds ?? [...user.branchIds];
  state.submissions.unshift(item);
  return toDetailDto(state, user, item);
};

interface Transition {
  readonly from: readonly ContentStatusValue[];
  readonly to: ContentStatusValue;
  readonly permission?: string;
}

const TRANSITIONS: Readonly<Record<string, Transition>> = {
  submit: { from: [0, 25], to: 5 },
  'flag-for-review': { from: [5], to: 10, permission: 'Approvals.Approve' },
  approve: { from: [5, 10], to: 15, permission: 'Approvals.Approve' },
  reject: { from: [5, 10], to: 25, permission: 'Approvals.Reject' },
  publish: { from: [5, 10, 15], to: 20, permission: 'Approvals.Publish' },
};

const transition = (state: MockState, request: MockRequest, action: string): unknown => {
  const user = requireUser(request);
  const rule = TRANSITIONS[action];
  const item = editable(state, request.params.id ?? '');
  if (!rule?.from.includes(item.status)) {
    throw new MockHttpFailure(
      400,
      `This content cannot be ${action.replace('-', ' ')}d from its current status.`,
    );
  }
  if (rule.permission !== undefined && !can(state, user, rule.permission)) {
    throw new MockHttpFailure(403, 'You do not have permission to perform this action.');
  }
  const body = (request.body ?? {}) as { note?: string | null; reason?: string };
  item.status = rule.to;
  if (action === 'submit') {
    item.submittedAt = state.now.toISOString();
    item.reviewNote = null;
  } else {
    item.reviewedByName = user.name;
    item.reviewNote = body.note ?? body.reason ?? item.reviewNote;
  }
  if (action === 'publish') {
    publishToCatalog(state, item);
  }
  return toDetailDto(state, user, item);
};

export const contentHandlers = (state: MockState): readonly MockRoute[] => [
  { method: 'GET', pattern: BASE, handler: (r) => list(state, r) },
  {
    method: 'GET',
    pattern: `${BASE}/approval-status-counts`,
    handler: (r) => counts(state, r),
  },
  {
    method: 'GET',
    pattern: `${BASE}/:id`,
    handler: (r) =>
      toDetailDto(state, requireUser(r), requireContent(state, r.params.id ?? '')),
  },
  { method: 'POST', pattern: BASE, handler: (r) => create(state, r) },
  ...Object.keys(TRANSITIONS).map(
    (action): MockRoute => ({
      method: 'POST',
      pattern: `${BASE}/:id/${action}`,
      handler: (r) => transition(state, r, action),
    }),
  ),
  {
    method: 'DELETE',
    pattern: `${BASE}/:id`,
    handler: (request) => {
      const item = requireContent(state, request.params.id ?? '');
      if (item.status === 20) {
        throw new MockHttpFailure(400, 'Published content cannot be deleted from here.');
      }
      state.submissions.splice(state.submissions.indexOf(item), 1);
      return null;
    },
  },
  {
    method: 'POST',
    pattern: `${BASE}/:id/request-media-upload`,
    handler: ({ body }) => ({
      blobName: `mock/${(body as { fileName: string }).fileName}`,
      // No upload URL: the client skips the direct blob upload ("storage not configured").
      uploadUrl: null,
      readUrl: null,
      method: 'PUT',
      headers: {},
    }),
  },
  {
    method: 'GET',
    pattern: `${BASE}/:id/media-read-sas-url`,
    handler: () => ({ readUrl: null }),
  },
];

export { editable };
