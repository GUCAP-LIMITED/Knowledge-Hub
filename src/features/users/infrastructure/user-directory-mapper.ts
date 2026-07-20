import type { BranchListItem, BranchUser } from '../domain';
import type { BranchListItemDto, BranchUserDto } from './dto/user-directory-api.dto';

export const toBranchUser = (dto: BranchUserDto): BranchUser => ({
  userId: dto.userId,
  userName: dto.userName,
  name: dto.name,
  email: dto.email,
  isActive: dto.isActive,
  userTypes: dto.userTypes.map((t) => ({ id: t.userTypeId, name: t.userTypeName })),
  branches: dto.branches.map((b) => ({
    branchId: b.branchId,
    branchName: b.branchName ?? '—',
    isPrimary: b.isPrimary,
  })),
  profileImageUrl: dto.profileImageUrl,
});

export const toBranchListItem = (dto: BranchListItemDto): BranchListItem => ({
  id: dto.id,
  name: dto.name,
});
