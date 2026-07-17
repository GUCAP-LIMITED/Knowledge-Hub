import { describe, expect, it } from 'vitest';
import type { HierarchyNodeDto } from './dto/hierarchy-edge-api.dto';
import { toHierarchyEdge, toHierarchyNode } from './hierarchy-edge-mapper';

describe('hierarchy mappers', () => {
  it('maps a nested node tree recursively', () => {
    const dto: HierarchyNodeDto = {
      userId: 'm',
      userName: 'Manager',
      email: null,
      profileImageUrl: null,
      userTypeId: 't2',
      userTypeName: 'SalesManager',
      hierarchyLevel: 3,
      reports: [
        {
          userId: 'c',
          userName: 'Consultant',
          email: null,
          profileImageUrl: null,
          userTypeId: 't1',
          userTypeName: 'Consultant',
          hierarchyLevel: 1,
          reports: [],
        },
      ],
    };

    const node = toHierarchyNode(dto);
    expect(node.reports).toHaveLength(1);
    expect(node.reports[0]?.userTypeName).toBe('Consultant');
  });

  it('narrows the edge source integer to the union', () => {
    const local = toHierarchyEdge({
      subordinateId: 's',
      subordinateUserTypeId: 't1',
      managerId: 'm',
      managerUserTypeId: 't2',
      branchId: 'b',
      source: 5,
    });
    expect(local.source).toBe(5);
    expect(toHierarchyEdge({ ...local, source: 0 }).source).toBe(0);
  });
});
