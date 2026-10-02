import { API_CONFIG } from './config';
import { request } from './client';
import type { CustomerReport, TaskReport, BillingReport, SummaryReport } from '../types/reporting';
import type { HealthResponse } from '../types/common';

export const reportingApi = {
  checkHealth: async (): Promise<HealthResponse> => {
    return request<HealthResponse>(`${API_CONFIG.reporting}/health`);
  },

  getCustomerReport: async (): Promise<CustomerReport> => {
    return request<CustomerReport>(`${API_CONFIG.reporting}/customers`);
  },

  getTaskReport: async (): Promise<TaskReport> => {
    return request<TaskReport>(`${API_CONFIG.reporting}/tasks`);
  },

  getBillingReport: async (): Promise<BillingReport> => {
    return request<BillingReport>(`${API_CONFIG.reporting}/billing`);
  },

  getSummaryReport: async (): Promise<SummaryReport> => {
    return request<SummaryReport>(`${API_CONFIG.reporting}/summary`);
  },
};
