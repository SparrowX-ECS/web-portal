export interface CustomerRead {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerCreate {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
}

export interface CustomerUpdate {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
}

export interface CustomerListParams {
  search?: string;
  offset?: number;
  limit?: number;
}
