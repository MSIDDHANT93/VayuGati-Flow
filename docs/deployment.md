# VayuGati Flow — Deployment Guide

This guide covers how to deploy the VayuGati Flow backend and frontend in development, staging, and production environments.

---

## Deployment Overview

VayuGati Flow consists of two independently deployable artifacts:

1. **Backend** — FastAPI application (`backend/`).
2. **Frontend** — React + TypeScript static bundle (`frontend/`).

For local development, both run on the same machine. For production, deploy the backend to a server or container platform and serve the frontend via a CDN or static host.

---

## Backend Deployment

### Local Development

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Linux/macOS
# .venv\Scripts\activate          # Windows
pip install -r requirements.txt

# Optional: copy and edit environment variables
cp .env.example .env

uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive docs are at `http://localhost:8000/docs`.

### Production (Uvicorn + Gunicorn)

```bash
cd backend
pip install -r requirements.txt

gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

Recommended production settings:

| Setting | Value | Rationale |
|---------|-------|-----------|
| Workers | `2 × CPU cores + 1` | Balances CPU utilization and memory |
| Timeout | `60s` | Accommodates LLM and CV inference |
| Keep-alive | `5s` | Standard for HTTP load balancers |
| `--proxy-headers` | Enabled | When behind a reverse proxy |

### Docker Deployment

Create a `Dockerfile` in `backend/`:

```dockerfile
FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
cd backend
docker build -t vayugati-api .
docker run -p 8000:8000 --env-file .env vayugati-api
```

### Cloud Deployment (Example: Railway / Render / Fly.io)

1. Set the **build command** to `pip install -r requirements.txt`.
2. Set the **start command** to `uvicorn main:app --host 0.0.0.0 --port $PORT`.
3. Add environment variables from the table below.
4. Enable auto-deploy from `main` if desired.

---

## Frontend Deployment

### Local Development

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Production Build

```bash
cd frontend
npm install
npm run build
```

The static bundle is output to `frontend/dist/`. Serve this directory with any static host:

- **nginx**
- **Apache**
- **Vercel**
- **Netlify**
- **GitHub Pages**
- **AWS S3 + CloudFront**

### Sample nginx Configuration

```nginx
server {
    listen 80;
    server_name vayugati.example.com;
    root /var/www/vayugati-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Vercel / Netlify

1. Set the **root directory** to `frontend/`.
2. Set the **build command** to `npm run build`.
3. Set the **output directory** to `dist/`.
4. Configure `VITE_API_BASE_URL` to point to your production backend.

---

## Environment Variables

### Backend Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | `VayuGati Flow API` | Application name in OpenAPI docs |
| `APP_VERSION` | `0.1.0` | API version string |
| `DEBUG` | `false` | Enable debug mode (do not use in production) |
| `API_PREFIX` | `/api/v1` | Route prefix for all API endpoints |
| `FIREWORKS_API_KEY` | `""` | API key for Fireworks AI reasoning |
| `FIREWORKS_MODEL` | `accounts/fireworks/models/llama-v3-70b-instruct` | LLM model identifier |
| `YOLO_MODEL_PATH` | `yolov8n.pt` | Path or name of YOLO weights |
| `CONFIDENCE_THRESHOLD` | `0.5` | Minimum detection confidence |

Create `backend/.env`:

```env
APP_NAME="VayuGati Flow API"
APP_VERSION="0.2.0"
DEBUG=false
API_PREFIX="/api/v1"
FIREWORKS_API_KEY=""
FIREWORKS_MODEL="accounts/fireworks/models/llama-v3-70b-instruct"
YOLO_MODEL_PATH="yolov8n.pt"
CONFIDENCE_THRESHOLD=0.5
```

### Frontend Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Base URL for backend API calls |

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

> **Note:** Vite only exposes environment variables prefixed with `VITE_` to the client bundle.

---

## Production Checklist

### Security

- [ ] Set `DEBUG=false` in production.
- [ ] Store secrets (`FIREWORKS_API_KEY`) in a secrets manager or environment variables, never in code.
- [ ] Run the backend behind HTTPS (TLS termination at the load balancer or reverse proxy).
- [ ] Restrict CORS origins in `backend/main.py` instead of using regex-based localhost matching.
- [ ] Disable interactive docs (`/docs`) if not required in production, or protect them.
- [ ] Add rate limiting on public endpoints.
- [ ] Add authentication and authorization before exposing production traffic data.

### Reliability

- [ ] Use a process manager (systemd, supervisord, or container orchestrator) to keep the backend running.
- [ ] Configure health checks and a `/health` endpoint for load balancers.
- [ ] Set up log aggregation (e.g., CloudWatch, Datadog, or Loki).
- [ ] Add application monitoring and alerting (e.g., Sentry, Prometheus/Grafana).
- [ ] Implement graceful shutdown handling for in-flight requests.

### Performance

- [ ] Use Gunicorn with Uvicorn workers for CPU-bound workloads.
- [ ] Offload YOLO inference to a GPU worker or managed inference service if live video is used.
- [ ] Cache deterministic traffic calculations when inputs have not changed.
- [ ] Use a CDN for static frontend assets.
- [ ] Enable gzip/Brotli compression on the reverse proxy.

### Scalability

- [ ] Containerize both backend and frontend.
- [ ] Use a load balancer with multiple backend replicas.
- [ ] Add Redis or a message queue for asynchronous Vision and Reasoning tasks.
- [ ] Plan for database persistence (PostgreSQL + TimescaleDB) when moving beyond stateless demo mode.

### Testing

- [ ] Run `pytest tests/` in `backend/` and confirm all tests pass.
- [ ] Run `npm run test:e2e` in `frontend/` and confirm all Playwright suites pass.
- [ ] Perform smoke tests against the deployed `/` and `/api/v1/pipeline/scenarios` endpoints.
- [ ] Verify CORS and API connectivity from the deployed frontend.

---

## Deployment Architecture Summary

```
                                  ┌─────────────────┐
                                  │      CDN        │
                                  │  (Static Site)  │
                                  └────────┬────────┘
                                           │
                                           ▼
┌──────────┐        HTTPS        ┌──────────────────┐         ┌─────────────┐
│  Client  │ ───────────────────▶│  Load Balancer   │──────────▶│  FastAPI    │
│  Browser │                     │  (TLS / nginx)   │         │  Backend    │
└──────────┘                     └──────────────────┘         └──────┬──────┘
                                                                   │
                              ┌────────────────────────────────────┼──────────────┐
                              │                                    │              │
                              ▼                                    ▼              ▼
                        ┌──────────┐                        ┌──────────┐   ┌──────────┐
                        │ Fireworks│                        │  YOLO    │   │  Redis   │
                        │    AI    │                        │  Worker  │   │  Cache   │
                        └──────────┘                        └──────────┘   └──────────┘
```

---

## Related Documentation

- [`developer-guide.md`](developer-guide.md) — Local development setup and workflows.
- [`architecture.md`](architecture.md) — System architecture and scaling strategy.
- [`prd/13-deployment.md`](prd/13-deployment.md) — PRD deployment chapter.
