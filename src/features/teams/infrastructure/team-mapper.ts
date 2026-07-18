import type { SelectableUserType, Team } from '../domain';
import type { TeamDto, TeamUserTypeOptionDto } from './dto/team-api.dto';

export const toTeam = (dto: TeamDto): Team => ({
  id: dto.id,
  name: dto.name,
  description: dto.description,
  isActive: dto.isActive,
  members: dto.members.map((m) => ({
    userTypeId: m.userTypeId,
    userTypeName: m.userTypeName,
  })),
});

export const toSelectableUserType = (dto: TeamUserTypeOptionDto): SelectableUserType => ({
  id: dto.id,
  name: dto.name,
});
