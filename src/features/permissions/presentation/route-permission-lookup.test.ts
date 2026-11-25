import { describe, expect, it } from 'vitest';
import {
  buildSidebarGroup,
  buildSidebarModule,
} from '@testing/builders/permission-set.builder';
import { buildRoutePermissionLookup } from './route-permission-lookup';

describe('buildRoutePermissionLookup', () => {
  it('resolves an exact static match', () => {
    const groups = [
      buildSidebarGroup({
        items: [buildSidebarModule({ href: '/teams', basePermission: 'Team.Manage' })],
      }),
    ];

    const lookup = buildRoutePermissionLookup(groups, ['/teams']);

    expect(lookup.get('/teams')).toBe('Team.Manage');
  });

  it('resolves a parameterized route via its list-page ancestor href', () => {
    const groups = [
      buildSidebarGroup({
        items: [buildSidebarModule({ href: '/courses', basePermission: 'Courses.View' })],
      }),
    ];

    const lookup = buildRoutePermissionLookup(groups, ['/courses/:id']);

    expect(lookup.get('/courses/:id')).toBe('Courses.View');
  });

  it('resolves through nested children', () => {
    const groups = [
      buildSidebarGroup({
        items: [
          buildSidebarModule({
            id: 'settings',
            href: '/settings',
            basePermission: 'Settings.View',
            children: [
              buildSidebarModule({
                id: 'user-types',
                href: '/settings/users/user-types',
                basePermission: 'UserTypes.View',
              }),
            ],
          }),
        ],
      }),
    ];

    const lookup = buildRoutePermissionLookup(groups, ['/settings/users/user-types']);

    expect(lookup.get('/settings/users/user-types')).toBe('UserTypes.View');
  });

  it('resolves a parameterized route against its parent href', () => {
    const groups = [
      buildSidebarGroup({
        items: [
          buildSidebarModule({ href: '/settings', basePermission: 'Settings.View' }),
        ],
      }),
    ];

    const lookup = buildRoutePermissionLookup(groups, ['/settings/:section']);

    expect(lookup.get('/settings/:section')).toBe('Settings.View');
  });

  it('does not falsely prefix-match across sibling routes', () => {
    const groups = [
      buildSidebarGroup({
        items: [buildSidebarModule({ href: '/teams', basePermission: 'Team.Manage' })],
      }),
    ];

    const lookup = buildRoutePermissionLookup(groups, ['/team-progress']);

    expect(lookup.has('/team-progress')).toBe(false);
  });

  it('leaves an unmatched route pattern out of the map', () => {
    const groups = [
      buildSidebarGroup({
        items: [buildSidebarModule({ href: '/teams', basePermission: 'Team.Manage' })],
      }),
    ];

    const lookup = buildRoutePermissionLookup(groups, ['/unregistered-route']);

    expect(lookup.has('/unregistered-route')).toBe(false);
  });

  it('matches root "/" when pattern is "/"', () => {
    const groups = [
      buildSidebarGroup({
        items: [buildSidebarModule({ href: '/', basePermission: 'Dashboard.View' })],
      }),
    ];

    const lookup = buildRoutePermissionLookup(groups, ['/']);

    expect(lookup.get('/')).toBe('Dashboard.View');
  });

  it('does not falsely match root "/" against child routes like /my-learning', () => {
    const groups = [
      buildSidebarGroup({
        items: [buildSidebarModule({ href: '/', basePermission: 'Dashboard.View' })],
      }),
    ];

    const lookup = buildRoutePermissionLookup(groups, ['/my-learning']);

    expect(lookup.has('/my-learning')).toBe(false);
  });

  it('returns an empty map for empty groups', () => {
    const lookup = buildRoutePermissionLookup([], ['/teams']);

    expect(lookup.size).toBe(0);
  });
});
