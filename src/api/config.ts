// Environment variable configuration for backend services
export const API_CONFIG = {
  customer: (import.meta.env.VITE_CUSTOMER_API_URL || 'http://localhost:8001').replace(/\/+$/, ''),
  notification: (import.meta.env.VITE_NOTIFICATION_API_URL || 'http://localhost:8004').replace(/\/+$/, ''),
  task: (import.meta.env.VITE_TASK_API_URL || 'http://localhost:8002').replace(/\/+$/, ''),
  billing: (import.meta.env.VITE_BILLING_API_URL || 'http://localhost:8003').replace(/\/+$/, ''),
  reporting: (import.meta.env.VITE_REPORTING_API_URL || 'http://localhost:8005').replace(/\/+$/, ''),
};
