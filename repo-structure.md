# Web portal repository structure

The web portal is a browser client, not an ECS-to-ECS backend client. It builds a static bundle with one public `VITE_API_BASE_URL`, then calls the `/api/` routes exposed through the ALB, CloudFront, or custom domain. It does not use ECS Service Connect names.
