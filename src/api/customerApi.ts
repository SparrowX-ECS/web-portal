import { API_CONFIG } from './config';
import { request } from './client';
import type { CustomerRead, CustomerCreate, CustomerUpdate, CustomerListParams } from '../types/customer';
import type { HealthResponse } from '../types/common';

export const customerApi = {
  checkHealth: async (): Promise<HealthResponse> => {
    return request<HealthResponse>(`${API_CONFIG.customer}/health`);
  },

  listCustomers: async (params?: CustomerListParams): Promise<CustomerRead[]> => {
    const searchParams = new URLSearchParams();
    if (params?.search) {
      searchParams.set('search', params.search);
    }
    if (params?.offset !== undefined) {
      searchParams.set('offset', String(params.offset));
    }
    if (params?.limit !== undefined) {
      searchParams.set('limit', String(params.limit));
    }

    const query = searchParams.toString();
    const url = `${API_CONFIG.customer}/customers${query ? `?${query}` : ''}`;
    return request<CustomerRead[]>(url);
  },

  getCustomer: async (id: number): Promise<CustomerRead> => {
    return request<CustomerRead>(`${API_CONFIG.customer}/customers/${id}`);
  },

  createCustomer: async (payload: CustomerCreate): Promise<CustomerRead> => {
    return request<CustomerRead>(`${API_CONFIG.customer}/customers`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateCustomer: async (id: number, payload: CustomerUpdate): Promise<CustomerRead> => {
    return request<CustomerRead>(`${API_CONFIG.customer}/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteCustomer: async (id: number): Promise<void> => {
    return request<void>(`${API_CONFIG.customer}/customers/${id}`, {
      method: 'DELETE',
    });
  },
};
