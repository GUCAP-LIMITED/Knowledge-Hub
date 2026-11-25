import { certificateIdFor, catalogRefs } from '../content-index';
import { MockHttpFailure, type MockRequest, type MockRoute } from '../mock-types';
import { normalizeQuery, paginate, requireUser, sortBy } from '../mock-context';
import type { MockState } from '../mock-state';
import type { DirectoryUser } from '../seed/directory-seed';
import type { MockUser } from '../seed/mock-users';

const BASE = '/api/app/certificate';
const CERT_BLOB = '/samples/sample.pdf';

interface Cert {
  readonly id: string;
  readonly title: string;
  readonly contentType: number;
  readonly user: DirectoryUser;
  readonly issuedAt: string;
}

/** Every certificate in the system: finished courses plus completed tutorials and resources. */
const allCertificates = (state: MockState): Cert[] => {
  const userById = (id: string): DirectoryUser | undefined =>
    state.directory.find((u) => u.id === id);
  const refs = catalogRefs(state);
  const fromCourses = state.enrollments.flatMap((e) => {
    const user = userById(e.userId);
    const ref = refs.find((r) => r.id === e.courseId);
    return e.status === 15 &&
      e.completedAt !== null &&
      user !== undefined &&
      ref !== undefined
      ? [
          {
            id: `cert-${e.id}`,
            title: ref.title,
            contentType: 0,
            user,
            issuedAt: e.completedAt,
          },
        ]
      : [];
  });
  const fromOthers = [...state.completions].flatMap(([key, completion]) => {
    const [userId = '', contentId = ''] = key.split(':');
    const user = userById(userId);
    const ref = refs.find((r) => r.id === contentId);
    return completion.at !== null && user !== undefined && ref !== undefined
      ? [
          {
            id: certificateIdFor(userId, contentId),
            title: ref.title,
            contentType: ref.type,
            user,
            issuedAt: completion.at,
          },
        ]
      : [];
  });
  return [...fromCourses, ...fromOthers];
};

const roleName = (state: MockState, user: DirectoryUser): string =>
  state.userTypes.find((t) => t.id === user.userTypeId)?.name ?? 'Learner';

const toDto = (state: MockState, cert: Cert): Record<string, unknown> => ({
  id: cert.id,
  contentItemTitle: cert.title,
  contentType: cert.contentType,
  userName: cert.user.name,
  roleName: roleName(state, cert.user),
  blobName: `${cert.id}.pdf`,
  blobUrl: CERT_BLOB,
  issuedAt: cert.issuedAt,
});

/** Who may see whose certificates: Self / Team / Branch / Everyone, by the viewer's data scope. */
const visibleTo = (viewer: MockUser, cert: Cert): boolean => {
  if (viewer.dataScope >= 15 || cert.user.id === viewer.id) return true;
  if (viewer.dataScope >= 10)
    return cert.user.branchIds.some((b) => viewer.branchIds.includes(b));
  if (viewer.dataScope >= 5)
    return cert.user.teamId !== null && viewer.teamIds.includes(cert.user.teamId);
  return false;
};

const list = (state: MockState, request: MockRequest): unknown => {
  const viewer = requireUser(request);
  const query = normalizeQuery(request.query);
  const needle = (query.filter ?? '').toLowerCase();
  const all = allCertificates(state);
  const matches = all.filter(
    (c) =>
      visibleTo(viewer, c) &&
      (query.isself !== 'true' || c.user.id === viewer.id) &&
      (query.usertypeid === undefined || c.user.userTypeId === query.usertypeid) &&
      (query.branchid === undefined || c.user.branchIds.includes(query.branchid)) &&
      (needle === '' || `${c.title} ${c.user.name}`.toLowerCase().includes(needle)),
  );
  const page = paginate(
    sortBy(matches, query.sorting ?? 'issuedAt desc', {
      issuedat: (c) => Date.parse(c.issuedAt),
      userName: (c) => c.user.name,
      username: (c) => c.user.name,
    }),
    query,
  );
  return {
    totalCount: page.totalCount,
    myTotalCertificates: all.filter((c) => c.user.id === viewer.id).length,
    items: page.items.map((c) => toDto(state, c)),
  };
};

const overview = (state: MockState, request: MockRequest): unknown => {
  const viewer = requireUser(request);
  const certs = allCertificates(state).filter((c) => visibleTo(viewer, c));
  return {
    totalIssuedCertificates: certs.length,
    totalTeamsWithCertificates: new Set(
      certs.map((c) => c.user.teamId).filter((t) => t !== null),
    ).size,
    totalCategories: new Set(certs.map((c) => c.contentType)).size,
    teams: state.teams.map((t) => ({
      teamId: t.id,
      teamName: t.name,
      certificateCount: certs.filter((c) => c.user.teamId === t.id).length,
    })),
    roles: state.userTypes.map((t) => ({
      userTypeId: t.id,
      roleName: t.name,
      certificateCount: certs.filter((c) => c.user.userTypeId === t.id).length,
    })),
  };
};

export const certificateHandlers = (state: MockState): readonly MockRoute[] => [
  { method: 'GET', pattern: BASE, handler: (r) => list(state, r) },
  {
    method: 'GET',
    pattern: `${BASE}/statistics-overview`,
    handler: (r) => overview(state, r),
  },
  {
    // Public: the QR code / share link opens this without signing in.
    method: 'GET',
    pattern: `${BASE}/:id`,
    handler: ({ params }) => {
      const cert = allCertificates(state).find((c) => c.id === params.id);
      if (cert === undefined) {
        throw new MockHttpFailure(404, 'Certificate not found');
      }
      return toDto(state, cert);
    },
  },
];
