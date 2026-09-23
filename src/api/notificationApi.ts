import { API_CONFIG } from './config';
import { request } from './client';
import type {
  NotificationRead,
  NotificationCreate,
  NotificationStatusUpdate,
  NotificationListParams,
} from '../types/notification';
import type { HealthResponse } from '../types/common';

export const notificationApi = {
  checkHealth: async (): Promise<HealthResponse> => {
    return request<HealthResponse>(`${API_CONFIG.notification}/health`);
  },

  listNotifications: async (params?: NotificationListParams): Promise<NotificationRead[]> => {
    const searchParams = new URLSearchParams();
    if (params?.channel) {
      searchParams.set('channel', params.channel);
    }
    if (params?.status) {
      searchParams.set('status', params.status);
    }

    const query = searchParams.toString();
    const url = `${API_CONFIG.notification}/notifications${query ? `?${query}` : ''}`;
    return request<NotificationRead[]>(url);
  },

  getNotification: async (id: number): Promise<NotificationRead> => {
    return request<NotificationRead>(`${API_CONFIG.notification}/notifications/${id}`);
  },

  createNotification: async (payload: NotificationCreate): Promise<NotificationRead> => {
    return request<NotificationRead>(`${API_CONFIG.notification}/notifications`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateNotificationStatus: async (
    id: number,
    payload: NotificationStatusUpdate
  ): Promise<NotificationRead> => {
    return request<NotificationRead>(`${API_CONFIG.notification}/notifications/${id}/status`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
