import { API_CONFIG } from './config';
import { request } from './client';
import type { InvoiceRead, InvoiceCreate, InvoiceListParams } from '../types/billing';
import type { HealthResponse } from '../types/common';

export const billingApi = {
  checkHealth: async (): Promise<HealthResponse> => {
    return request<HealthResponse>(`${API_CONFIG.billing}/health`);
  },

  listInvoices: async (params?: InvoiceListParams): Promise<InvoiceRead[]> => {
    const searchParams = new URLSearchParams();
    if (params?.status) {
      searchParams.set('status', params.status);
    }
    if (params?.offset !== undefined) {
      searchParams.set('offset', String(params.offset));
    }
    if (params?.limit !== undefined) {
      searchParams.set('limit', String(params.limit));
    }

    const query = searchParams.toString();
    const url = `${API_CONFIG.billing}/${query ? `?${query}` : ''}`;
    return request<InvoiceRead[]>(url);
  },

  getInvoice: async (id: number): Promise<InvoiceRead> => {
    return request<InvoiceRead>(`${API_CONFIG.billing}/${id}`);
  },

  createInvoice: async (payload: InvoiceCreate): Promise<InvoiceRead> => {
    return request<InvoiceRead>(`${API_CONFIG.billing}/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  payInvoice: async (id: number): Promise<InvoiceRead> => {
    return request<InvoiceRead>(`${API_CONFIG.billing}/${id}/pay`, {
      method: 'POST',
    });
  },

  cancelInvoice: async (id: number): Promise<InvoiceRead> => {
    return request<InvoiceRead>(`${API_CONFIG.billing}/${id}/cancel`, {
      method: 'POST',
    });
  },
};
