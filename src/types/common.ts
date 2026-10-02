export interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}

export interface HealthResponse {
  status: string;
  [key: string]: string;
}

export type NavSection = 'dashboard' | 'customers' | 'notifications' | 'tasks' | 'billing' | 'reports';
