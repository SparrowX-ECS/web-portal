export type InvoiceStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export interface InvoiceRead {
  id: number;
  customer_id: number;
  amount: string;
  currency: string;
  status: InvoiceStatus;
  created_at: string;
}

export interface InvoiceCreate {
  customer_id: number;
  amount: number | string;
  currency: string;
}

export interface InvoiceListParams {
  status?: InvoiceStatus | null;
  offset?: number;
  limit?: number;
}
