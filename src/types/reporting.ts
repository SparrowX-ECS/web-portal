export interface CustomerReport {
  customers: number;
}

export interface TaskReport {
  open_tasks: number;
}

export interface BillingReport {
  pending_invoices: number;
}

export interface SummaryReport {
  customers: number;
  open_tasks: number;
  pending_invoices: number;
}
