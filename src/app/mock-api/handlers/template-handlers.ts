import { normalizeQuery, notFound, paginate } from '../mock-context';
import { nextId, type MockState } from '../mock-state';
import { MockHttpFailure, type MockRoute } from '../mock-types';
import type { MockEmailTemplate } from '../seed/template-seed';

const BASE = '/api/app/communication-template';
const CERT = '/api/app/certificate-template';

const find = (state: MockState, id: string): MockEmailTemplate => {
  const template = state.emailTemplates.find((t) => t.id === id);
  if (template === undefined) {
    throw notFound('Template');
  }
  return template;
};

interface TemplateInput {
  readonly name: string;
  readonly body: string;
  readonly kind: 1 | 2;
  readonly isDefault?: boolean;
  readonly isActive?: boolean;
}

const emailRoutes = (state: MockState): readonly MockRoute[] => [
  {
    method: 'GET',
    pattern: BASE,
    handler: ({ query }) => {
      const q = normalizeQuery(query);
      const needle = (q.filter ?? '').toLowerCase();
      const matches = state.emailTemplates.filter(
        (t) =>
          (q.kind === undefined || t.kind === Number(q.kind)) &&
          (q.isactive === undefined || t.isActive === (q.isactive === 'true')) &&
          `${t.name} ${t.body}`.toLowerCase().includes(needle),
      );
      return paginate(matches, q);
    },
  },
  {
    method: 'GET',
    pattern: `${BASE}/:id`,
    handler: ({ params }) => find(state, params.id ?? ''),
  },
  {
    method: 'POST',
    pattern: BASE,
    handler: ({ body }) => {
      const input = body as TemplateInput;
      const template: MockEmailTemplate = {
        id: nextId(state, 'tpl'),
        name: input.name,
        body: input.body,
        kind: input.kind,
        isDefault: input.isDefault ?? false,
        isActive: input.isActive ?? true,
        ownerUserId: null,
        creationTime: state.now.toISOString(),
        lastModificationTime: null,
      };
      state.emailTemplates.unshift(template);
      return template;
    },
  },
  {
    method: 'PUT',
    pattern: `${BASE}/:id/set-active`,
    handler: ({ params, query }) => {
      const template = find(state, params.id ?? '');
      template.isActive = query.isActive === 'true';
      template.lastModificationTime = state.now.toISOString();
      return template;
    },
  },
  {
    method: 'PUT',
    pattern: `${BASE}/:id`,
    handler: ({ params, body }) => {
      const template = find(state, params.id ?? '');
      const input = body as TemplateInput;
      Object.assign(template, {
        name: input.name,
        body: input.body,
        kind: input.kind,
        isActive: input.isActive ?? template.isActive,
        lastModificationTime: state.now.toISOString(),
      });
      return template;
    },
  },
  {
    method: 'DELETE',
    pattern: `${BASE}/:id`,
    handler: ({ params }) => {
      const template = find(state, params.id ?? '');
      if (template.isDefault) {
        throw new MockHttpFailure(400, 'The default template cannot be deleted.');
      }
      state.emailTemplates.splice(state.emailTemplates.indexOf(template), 1);
      return null;
    },
  },
];

const certificateRoutes = (state: MockState): readonly MockRoute[] => [
  {
    method: 'GET',
    pattern: `${CERT}/:kind`,
    handler: ({ params }) => {
      const saved = state.certificateTemplates.get(Number(params.kind));
      if (saved === undefined) {
        throw new MockHttpFailure(404, 'No custom template');
      }
      return saved;
    },
  },
  {
    method: 'PUT',
    pattern: CERT,
    handler: ({ body }) => {
      const { kind, html } = body as { kind: string | number; html: string };
      const kinds: Record<string, number> = { Course: 0, Tutorial: 5, Resource: 10 };
      const key = typeof kind === 'number' ? kind : (kinds[kind] ?? 0);
      const saved = { content: html, lastModificationTime: state.now.toISOString() };
      state.certificateTemplates.set(key, saved);
      return saved;
    },
  },
];

export const templateHandlers = (state: MockState): readonly MockRoute[] => [
  ...emailRoutes(state),
  ...certificateRoutes(state),
];
