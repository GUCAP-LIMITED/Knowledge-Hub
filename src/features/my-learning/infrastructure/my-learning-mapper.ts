import { MyLearningItem } from '../domain/entities/my-learning-item';
import type {
  AssignedScopeKey,
  ContentTypeKey,
  LearningOriginKey,
  MyLearningStats,
  MyLearningStatusKey,
} from '../domain/types';
import type { MyLearningItemRow, MyLearningStatsRow } from './dto/my-learning-api.dto';

const mapContentType = (value: number): ContentTypeKey => {
  if (value === 5) return 'tutorial';
  if (value === 10) return 'resource';
  return 'course';
};

const mapOrigin = (value: number): LearningOriginKey => {
  if (value === 2) return 'assigned';
  return 'self';
};

const mapAssignedScope = (value: number | null | undefined): AssignedScopeKey | null => {
  if (value === 1) return 'me';
  if (value === 2) return 'team';
  if (value === 3) return 'role';
  return null;
};

const mapStatus = (value: number): MyLearningStatusKey => {
  switch (value) {
    case 1:
      return 'inProgress';
    case 2:
      return 'completed';
    case 3:
      return 'overdue';
    case 4:
      return 'paused';
    default:
      return 'notStarted';
  }
};

const parseDate = (val?: string | null): Date | null => (val ? new Date(val) : null);
const opt = <T>(val?: T | null): T | null => (val !== undefined ? val : null);

export const toMyLearningItem = (row: MyLearningItemRow): MyLearningItem =>
  new MyLearningItem({
    id: row.id,
    slug: opt(row.slug),
    assignmentId: opt(row.assignmentId),
    enrollmentId: opt(row.enrollmentId),
    title: row.title,
    subtitle: opt(row.subtitle),
    description: opt(row.description),
    contentType: mapContentType(row.contentType),
    contentTypeName: row.contentTypeName,
    origin: mapOrigin(row.origin),
    originName: row.originName,
    assignedScope: mapAssignedScope(row.assignedScope),
    assignedScopeName: opt(row.assignedScopeName),
    status: mapStatus(row.status),
    statusName: row.statusName,
    progress: row.progress,
    dueDate: parseDate(row.dueDate),
    isOverdue: row.isOverdue,
    daysRemaining: opt(row.daysRemaining),
    enrolledOrAssignedAt: new Date(row.enrolledOrAssignedAt),
    lastAccessedAt: parseDate(row.lastAccessedAt),
    completedAt: parseDate(row.completedAt),
    totalLessons: row.totalLessons,
    completedLessons: row.completedLessons,
    durationSeconds: row.durationSeconds,
    difficultyName: row.difficultyName,
    categoryName: opt(row.categoryName),
    topic: opt(row.topic),
    thumbnailUrl: opt(row.thumbnailUrl),
    certificateId: opt(row.certificateId),
    certificateUrl: opt(row.certificateUrl),
    isAccessible: row.isAccessible,
    isPublished: row.isPublished,
    helpfulCount: row.helpfulCount,
    rating: row.averageRating,
    totalReviews: row.totalReviews,
    actionLabel: row.actionLabel,
  });

export const toMyLearningStats = (row: MyLearningStatsRow): MyLearningStats => ({
  totalCount: row.totalCount,
  selfCount: row.selfCount,
  assignedCount: row.assignedCount,
  assignedMeCount: row.assignedMeCount,
  assignedTeamCount: row.assignedTeamCount,
  assignedRoleCount: row.assignedRoleCount,
  inProgressCount: row.inProgressCount,
  completedCount: row.completedCount,
  overdueCount: row.overdueCount,
});
