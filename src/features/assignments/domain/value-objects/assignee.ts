export type AssigneeCategory = 'user' | 'team' | 'userType';

export interface AssignmentAssignee {
  readonly category: AssigneeCategory;
  readonly targetId: string;
  readonly displayName: string;
  readonly email?: string | undefined;
}

export interface AssignableUser {
  readonly id: string;
  readonly name: string;
  readonly surname: string;
  readonly email: string;
  readonly userName: string;
}
