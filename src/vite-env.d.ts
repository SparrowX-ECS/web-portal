/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CUSTOMER_API_URL?: string;
  readonly VITE_NOTIFICATION_API_URL?: string;
  readonly VITE_TASK_API_URL?: string;
  readonly VITE_BILLING_API_URL?: string;
  readonly VITE_REPORTING_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
