export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

export interface TaskRead {
  id: number;
  title: string;
  description: string | null;
  assigned_to: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string | null;
  assigned_to?: string | null;
}

export interface TaskUpdate {
  title?: string | null;
  description?: string | null;
  assigned_to?: string | null;
  status?: TaskStatus | null;
}

export interface TaskListParams {
  status?: TaskStatus | null;
  assigned_to?: string | null;
  offset?: number;
  limit?: number;
}
