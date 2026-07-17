import type { AssignmentSource, HierarchyEdge, HierarchyNode } from '../domain';
import type { HierarchyEdgeDto, HierarchyNodeDto } from './dto/hierarchy-edge-api.dto';

function toSource(value: number): AssignmentSource {
  return value === 5 ? 5 : 0;
}

/** Recursively translate the org-chart tree DTO into domain nodes. */
export function toHierarchyNode(dto: HierarchyNodeDto): HierarchyNode {
  return {
    userId: dto.userId,
    userName: dto.userName,
    email: dto.email,
    profileImageUrl: dto.profileImageUrl,
    userTypeId: dto.userTypeId,
    userTypeName: dto.userTypeName,
    hierarchyLevel: dto.hierarchyLevel,
    reports: dto.reports.map(toHierarchyNode),
  };
}

export function toHierarchyEdge(dto: HierarchyEdgeDto): HierarchyEdge {
  return {
    subordinateId: dto.subordinateId,
    subordinateUserTypeId: dto.subordinateUserTypeId,
    managerId: dto.managerId,
    managerUserTypeId: dto.managerUserTypeId,
    branchId: dto.branchId,
    source: toSource(dto.source),
  };
}
