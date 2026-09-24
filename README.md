# SparrowX Web Portal

The **SparrowX Web Portal** is the centralized frontend application for SparrowX Labs, owned by the Product Experience Team. It provides an intuitive, clean interface for interacting with the five core SparrowX backend microservices running across the platform.

---

## Backend API Dependencies

The web portal integrates directly with five independent backend services:

1. **Customer API** (Alex Morgan, Customer Experience Team): Customer accounts CRUD, search, and pagination.
2. **Notification API** (Emma Carter, Communications Team): Notification dispatch and lifecycle status tracking (`email`, `sms`, `push`).
3. **Task API** (Daniel Brooks, Operations Team): Task creation, status lifecycle (`TODO`, `IN_PROGRESS`, `DONE`, `CANCELLED`), and assignment.
4. **Billing API** (Sophie Wilson, Finance Platform Team): Customer invoices and payment settlement (`PENDING`, `PAID`, `CANCELLED`).
5. **Reporting API** (Noah Taylor, Analytics Team): Read-only aggregated operational metrics over HTTP across upstream services.

---

## API Configuration

The frontend uses one public backend origin. This must be the ALB DNS name, CloudFront DNS name, or custom domain reachable from the client's browser. Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

| Environment Variable | Example | Purpose |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://sparrowx-ecs.mo2cloud.com` | Public backend origin |

The application appends `/api/customer`, `/api/notification`, `/api/task`, `/api/billing`, and `/api/reporting` to this origin. ECS Service Connect names are used only for backend-to-backend traffic and must not be exposed to the browser.

---

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The portal runs by default at `http://localhost:3000`.

### 3. Run Frontend Tests

```bash
npm test
```

### 4. Build for Production

```bash
npm run build
```

The production assets will be built into the `./dist` directory.

---

## Docker Deployment

The container uses a multi-stage build (`Node 22` build stage &rarr; `Nginx Alpine` serving stage) and runs securely as a non-root user (`nginx`).

### Build Container Image

```bash
docker build -t sparrowx-web-portal .
```

### Run Container

```bash
docker run --rm -p 8080:8080 sparrowx-web-portal
```

The application will be accessible at:
- Web Portal UI: `http://localhost:8080/`
- Health Endpoint: `http://localhost:8080/health` (returns `OK`)
