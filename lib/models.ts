export type EntityId = string;
export type ISODate = string;
export type ISOTimestamp = string;

export interface EntityMetadata {
  id: EntityId;
  revision: number;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface User extends EntityMetadata {
  identityReference: string;
  displayName: string;
  timezone: string;
}

export interface Goal extends EntityMetadata {
  ownerId: EntityId;
  title: string;
  description: string;
  targetDate: ISODate | null;
}

export interface Milestone extends EntityMetadata {
  goalId: EntityId;
  title: string;
  description: string;
  deadline: ISODate | null;
}

type TaskCompletion =
  { completed: false; completedAt: null } | { completed: true; completedAt: ISOTimestamp };

export type Task = EntityMetadata & {
  goalId: EntityId;
  milestoneId: EntityId | null;
  title: string;
  description: string;
  deadline: ISODate | null;
} & TaskCompletion;

export interface ProgressSummary {
  totalTasks: number;
  completedTasks: number;
  percentage: number;
}
