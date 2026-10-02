// The browser can only reach the public ALB, CloudFront, or custom domain.
// ECS Service Connect names are for backend-to-backend traffic only.
const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '');

export const API_CONFIG = {
  customer: `${baseUrl}/api/customers`,
  notification: `${baseUrl}/api/notifications`,
  task: `${baseUrl}/api/tasks`,
  billing: `${baseUrl}/api/billing`,
  reporting: `${baseUrl}/api/reporting`,
};
