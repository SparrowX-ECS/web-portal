import { API_CONFIG } from './config';
import { request } from './client';
import type { TaskRead, TaskCreate, TaskUpdate, TaskListParams } from '../types/task';
import type { HealthResponse } from '../types/common';

export const taskApi = {
  checkHealth: async (): Promise<HealthResponse> => {
    return request<HealthResponse>(`${API_CONFIG.task}/health`);
  },

  listTasks: async (params?: TaskListParams): Promise<TaskRead[]> => {
    const searchParams = new URLSearchParams();
    if (params?.status) {
      searchParams.set('status', params.status);
    }
    if (params?.assigned_to) {
      searchParams.set('assigned_to', params.assigned_to);
    }
    if (params?.offset !== undefined) {
      searchParams.set('offset', String(params.offset));
    }
    if (params?.limit !== undefined) {
      searchParams.set('limit', String(params.limit));
    }

    const query = searchParams.toString();
    const url = `${API_CONFIG.task}/tasks${query ? `?${query}` : ''}`;
    return request<TaskRead[]>(url);
  },

  getTask: async (id: number): Promise<TaskRead> => {
    return request<TaskRead>(`${API_CONFIG.task}/tasks/${id}`);
  },

  createTask: async (payload: TaskCreate): Promise<TaskRead> => {
    return request<TaskRead>(`${API_CONFIG.task}/tasks`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateTask: async (id: number, payload: TaskUpdate): Promise<TaskRead> => {
    return request<TaskRead>(`${API_CONFIG.task}/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteTask: async (id: number): Promise<void> => {
    return request<void>(`${API_CONFIG.task}/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};
