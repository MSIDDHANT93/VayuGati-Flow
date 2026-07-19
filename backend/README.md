# VayuGati Flow — Backend

FastAPI backend for the VayuGati Flow Urban Decision Intelligence platform.

## Requirements

- Python >=3.11 (the codebase relies on `datetime.UTC`, which is only available in 3.11+). Python 3.13 is recommended.
- `pip` or equivalent package manager

## Quick Start

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Linux/macOS
# .venv\Scripts\activate          # Windows
pip install -r requirements.txt

# Optional: configure environment variables
cp .env.example .env

uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.
Interactive API documentation is available at `http://localhost:8000/docs`.

## API Modules

| Module | Endpoint | Description |
|--------|----------|-------------|
| Traffic Intelligence | `POST /api/v1/traffic/analyze` | HCM-based deterministic traffic analysis |
| Computer Vision | `POST /api/v1/vision/analyze` | YOLO object detection from base64 images |
| AI Reasoning | `POST /api/v1/reasoning/analyze` | Fireworks AI explanations and recommendations |
| Pipeline | `POST /api/v1/pipeline/demo` | End-to-end demo pipeline |
| Pipeline | `GET /api/v1/pipeline/scenarios` | List available demo scenarios |

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

```bash
cp .env.example .env
```

Key variables:

- `APP_NAME` — API name shown in OpenAPI docs.
- `APP_VERSION` — API version string.
- `API_PREFIX` — Route prefix (default `/api/v1`).
- `FIREWORKS_API_KEY` — API key for live LLM reasoning.
- `YOLO_MODEL_PATH` — Path or name of the YOLO weights file.
- `CONFIDENCE_THRESHOLD` — Minimum detection confidence.

## Testing

```bash
python -m pytest tests/ -v
```

The backend currently includes 149 Pytest tests covering traffic algorithms, services, schemas, and API integration.

## Project Documentation

- [Main README](../README.md)
- [Architecture](../docs/architecture.md)
- [Developer Guide](../docs/developer-guide.md)
- [Deployment Guide](../docs/deployment.md)
- [System Overview](../docs/SYSTEM_OVERVIEW.md)
