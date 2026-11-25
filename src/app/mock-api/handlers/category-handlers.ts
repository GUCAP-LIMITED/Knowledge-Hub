import { notFound } from '../mock-context';
import { nextId, type MockState } from '../mock-state';
import { MockHttpFailure, type MockRoute } from '../mock-types';
import type { MockCategory } from '../seed/categories';

const BASE = '/api/app/content-category';

const slugify = (name: string): string =>
  name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-');

const find = (state: MockState, id: string): MockCategory => {
  const category = state.categories.find((c) => c.id === id);
  if (category === undefined) {
    throw notFound('Category');
  }
  return category;
};

export const categoryHandlers = (state: MockState): readonly MockRoute[] => [
  {
    method: 'POST',
    pattern: BASE,
    handler: ({ body }) => {
      const input = body as { type: 0 | 5 | 10; name: string };
      if (
        state.categories.some(
          (c) =>
            c.type === input.type && c.name.toLowerCase() === input.name.toLowerCase(),
        )
      ) {
        throw new MockHttpFailure(
          400,
          `"${input.name}" already exists for this content type.`,
        );
      }
      const category: MockCategory = {
        id: nextId(state, 'cat'),
        type: input.type,
        name: input.name,
        slug: slugify(input.name),
      };
      state.categories.push(category);
      return category;
    },
  },
  {
    method: 'PUT',
    pattern: `${BASE}/:id`,
    handler: ({ params, body }) => {
      const category = find(state, params.id ?? '');
      const name = (body as { name: string }).name;
      Object.assign(category, { name, slug: slugify(name) });
      return category;
    },
  },
  {
    method: 'DELETE',
    pattern: `${BASE}/:id`,
    handler: ({ params }) => {
      const category = find(state, params.id ?? '');
      state.categories.splice(state.categories.indexOf(category), 1);
      return null;
    },
  },
];
