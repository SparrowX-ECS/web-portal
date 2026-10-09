# SparrowX Web Portal

React/Vite frontend for the fictional SparrowX SaaS platform. This repository is the frontend demonstration workload: it is deployed to ECS/Fargate and generates frontend-to-backend traffic against the Customer, Task, Notification, Billing, and Reporting APIs in the selected environment.

## Service responsibilities

- Provide the browser-based SparrowX dashboard and service pages.
- Consume backend APIs through the environment ALB.
- Build environment-specific API origins into the static bundle.
- Serve the compiled application from an unprivileged Nginx container.

## API documentation

This repository is a frontend, not an API server, so it does not expose a FastAPI `/docs` endpoint. The backend API documentation is available in the corresponding repositories:

- [Customer API](https://github.com/SparrowX-ECS/customer-api#api-documentation) — `/docs`
- [Notification API](https://github.com/SparrowX-ECS/notification-api#api-documentation) — `/docs`
- [Task API](https://github.com/SparrowX-ECS/task-api#api-documentation) — `/docs`
- [Billing API](https://github.com/SparrowX-ECS/billing-api#api-documentation) — `/docs`
- [Reporting API](https://github.com/SparrowX-ECS/reporting-api#api-documentation) — `/docs`

The portal itself is health-checked at `/health` and uses `/health` as its deployment smoke-test path. Deployed frontend validation also checks the HTML SPA shell at `/`.

## Runtime and build environment variables

The frontend API origin is embedded at build time rather than read from the browser container at runtime.

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Yes for deployment | Public base URL used by the browser to call the selected environment’s backend APIs. |

The value is supplied from `frontend.apiBaseUrl` in the selected ECS parameters file: the development URL for `dev` and the production URL for `prod`.

## Local development

```bash
npm ci
npm test
npm run build
npm run dev
```

For local development, copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to a reachable API origin.

## CI/CD cycle

Pull requests run the shared Node test workflow, source-security scan, non-authoritative frontend build, and PR quality gate using `app-sec-policy.yaml`. A merge to `main` runs the authoritative frontend build, image security scan, CI quality gate, Cosign signing, and publishes image metadata.

The development deployment resolves the signed image, deploys it to `dev`, runs the `/health` smoke test, runs deployed frontend checks against `/health` and `/`, runs the Node DAST baseline scan, and evaluates the development quality gate before publishing the production candidate.

The manually confirmed production workflow resolves the candidate, verifies and copies the exact image by digest from the `dev` ECR namespace to `prod`, deploys it, runs the smoke and deployed frontend tests, and evaluates the production quality gate. A passing gate publishes deployment metadata; a failed gate resolves and deploys the previous production image. This is **Build Once, Promote Many**: the production frontend image is not rebuilt.

## Environments and deployment tracking

`dev` deploys automatically from `main`; `prod` is promoted manually after development validation. Each environment has its own ECS service, ECR namespace, API base URL, parameter file, SSM metadata path, and GitHub deployment history. See [`ecs-parameters-dev.yaml`](ecs-parameters-dev.yaml) and [`ecs-parameters-prod.yaml`](ecs-parameters-prod.yaml).

## Rollback options

### Git revert

Revert the problematic frontend or deployment configuration commit and merge it. The normal pipeline will build, scan, and deploy the corrective image.

### Quicker manual image rollback

1. Open **Deployments**, select the `prod` environment, and open the desired previous deployment.
2. Copy the deployed image tag.
3. Open **Actions → Manual Rollback Production To Selected Image Tag → Run workflow**.
4. Enter `ROLLBACK`, paste the image tag, and run the workflow.

The selected immutable image is redeployed and smoke-tested without rebuilding. ECS deployment circuit-breaker rollback is also enabled.

## Repository variables

| Variable | Description |
| --- | --- |
| `AWS_ACCOUNT_ID` | AWS account containing ECS and ECR resources. |
| `AWS_REGION` | AWS region used by GitHub Actions. |
| `AWS_ROLE_NAME` | IAM role assumed through GitHub OIDC. |
| `DEV_BASE_URL` | Development smoke-test origin with protocol and domain only. |
| `DEV_DEPLOYED_PARAM_STORE_PATH` | SSM path for the last successful `dev` image. |
| `PROD_BASE_URL` | Production smoke-test origin with protocol and domain only. |
| `PROD_CANDIDATE_PARAM_STORE_PATH` | SSM path for the production candidate image. |
| `PROD_DEPLOYED_PARAM_STORE_PATH` | SSM path for the last successful `prod` image. |

The repository also contains `api-tests/test_web_portal.test.ts`. These are deployed frontend checks, not backend API CRUD tests: they verify that `/health` returns `200 OK` and that `/` serves the built SPA shell.

The smoke-test workflow appends `/health` to the selected base URL. The base URL must not include a path.

## Container and deployment configuration

- Container port: `8080`.
- ALB path: `/*`.
- Health check: `/health`.
- Smoke-test path: `/health`.
- Database: disabled; the portal calls backend APIs over the environment ALB.

## License

This is a proprietary portfolio project. It is publicly viewable but not open source. All rights are reserved. See [LICENSE.md](LICENSE.md).
