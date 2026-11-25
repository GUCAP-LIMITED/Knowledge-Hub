export type ContentTypeKey = 'course' | 'tutorial' | 'resource';

export type LearningOriginKey = 'self' | 'assigned';

export type AssignedScopeKey = 'all' | 'me' | 'team' | 'role';

export type MyLearningStatusKey =
  | 'notStarted'
  | 'inProgress'
  | 'completed'
  | 'overdue'
  | 'paused';

export interface MyLearningStatusOption {
  readonly value: number;
  readonly name: string;
  readonly label: string;
}

export interface MyLearningQueryParams {
  readonly skipCount: number;
  readonly maxResultCount: number;
  readonly filter?: string | undefined;
  readonly origin?: number | undefined; // 1 = Self, 2 = Assigned
  readonly assignedScope?: number | undefined; // 0 = All, 1 = Me, 2 = Team, 3 = Role
  readonly contentType?: number | undefined; // 0 = Course, 5 = Tutorial, 10 = Resource
  readonly status?: number | undefined; // 0 = NotStarted, 1 = InProgress, 2 = Completed, 3 = Overdue, 4 = Paused
  readonly sorting?: string | undefined;
}

export interface MyLearningStats {
  readonly totalCount: number;
  readonly selfCount: number;
  readonly assignedCount: number;
  readonly assignedMeCount: number;
  readonly assignedTeamCount: number;
  readonly assignedRoleCount: number;
  readonly inProgressCount: number;
  readonly completedCount: number;
  readonly overdueCount: number;
}
