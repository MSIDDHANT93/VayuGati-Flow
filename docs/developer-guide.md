# VayuGati Flow — Developer Guide

This guide explains how to set up the development environment, navigate the codebase, follow coding standards, and contribute to VayuGati Flow.

---

## Project Structure

### Top-Level Layout

```
VayuGati-Flow/
├── ai_agents/        # Agent prompts and LLM orchestration
├── api/              # OpenAPI artifacts and API documentation
├── assets/           # Static assets
├── backend/          # FastAPI application and tests
├── docs/             # Project documentation
├── examples/         # Example requests and scripts
├── frontend/         # React + TypeScript dashboard
├── simulation/       # Traffic simulation utilities
├── LICENSE           # MIT License
└── README.md         # Project overview
```

### Backend Structure

```
backend/
├── app/
│   ├── config.py               # Pydantic-settings based configuration
│   ├── models/                 # Domain models
│   ├── routers/                # FastAPI route handlers
│   ├── schemas/                # Pydantic v2 request/response schemas
│   ├── services/               # Core business logic
│   └── utils/                  # Shared utilities
├── tests/                      # Pytest test suite
├── main.py                     # Application entry point
├── requirements.txt            # Python dependencies
└── pytest.ini                 # Pytest configuration
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/             # React components organized by panel
│   ├── data/                   # GIS and scenario reference data
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # Utility functions
├── tests/                      # Playwright E2E and visual tests
├── index.html                  # HTML entry point
├── package.json                # Node dependencies and scripts
├── playwright.config.ts        # Playwright configuration
├── tailwind.config.js          # TailwindCSS configuration
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite configuration
```

---

## Coding Standards

### Python (Backend)

- **Python version:** 3.11+ (3.13 recommended).
- **Formatting:** Follow PEP 8. Use 4 spaces for indentation.
- **Type hints:** Use type annotations on function signatures and class attributes.
- **Pydantic:** Use Pydantic v2 for all request/response schemas and settings.
- **Docstrings:** Use Google-style docstrings for modules, classes, and public functions.
- **Imports:** Group imports as standard library, third-party, and local. Keep imports at the top of the file.
- **Error handling:** Raise typed exceptions and return standardized `APIResponse` envelopes from routers.
- **Testing:** Write Pytest tests for every service, algorithm, and router.

Example:

```python
from app.services.traffic_analysis_service import TrafficAnalysisService


def analyze_intersection(intersection: Intersection) -> TrafficAnalysisResult:
    """Analyze traffic for a single intersection.

    Args:
        intersection: The intersection domain model.

    Returns:
        TrafficAnalysisResult with computed metrics.
    """
    service = TrafficAnalysisService()
    return service.analyze(intersection)
```

### TypeScript / React (Frontend)

- **Language:** TypeScript 5.4+ with strict mode enabled.
- **Components:** Use functional components with hooks.
- **Styling:** Use TailwindCSS utility classes. Avoid arbitrary values when design tokens exist.
- **State:** Prefer local state; use custom hooks for shared logic.
- **Types:** Define interfaces in `src/types/` and import them explicitly.
- **Linting:** Run `npm run lint` before committing.
- **Accessibility:** Use semantic HTML and ARIA labels where appropriate.

Example:

```tsx
import { TrafficMetrics } from '../types/traffic';

interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
}

export function MetricCard({ title, value, unit }: MetricCardProps) {
  return (
    <div className="rounded-lg bg-slate-800 p-4">
      <h3 className="text-sm text-slate-400">{title}</h3>
      <p className="text-2xl font-semibold text-white">
        {value.toFixed(2)} {unit}
      </p>
    </div>
  );
}
```

### Documentation Standards

- Follow [`docs/STYLE_GUIDE.md`](STYLE_GUIDE.md) for Markdown, Mermaid, and requirement ID conventions.
- Use descriptive headings and tables for structured information.
- Keep architectural decisions in `docs/adr/`.
- Cross-reference related documents where appropriate.

---

## Branch Strategy

We use a lightweight Git flow:

- **`main`** — Production-ready code. All merges require review.
- **`develop`** — Integration branch for active development (optional for small teams).
- **`feature/<short-name>`** — New features (e.g., `feature/realtime-websocket`).
- **`bugfix/<short-name>`** — Bug fixes (e.g., `bugfix/los-calculation`).
- **`docs/<short-name>`** — Documentation updates (e.g., `docs/deployment-guide`).
- **`adr/<short-name>`** — Architecture decision records.

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>
```

Common types:

| Type | Use Case |
|------|----------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `chore` | Maintenance, dependency updates |

Examples:

```
feat(backend): add websocket endpoint for live metrics
docs(readme): update quick start instructions
test(frontend): add Playwright test for scenario selector
```

---

## Testing Workflow

### Backend Tests

```bash
cd backend
python -m pytest tests/ -v
```

Run a specific test file:

```bash
python -m pytest tests/test_traffic_algorithms.py -v
```

Run with coverage:

```bash
python -m pytest tests/ --cov=app --cov-report=term-missing
```

### Frontend Tests

Install Playwright browsers once:

```bash
cd frontend
npx playwright install chromium
```

Run all E2E and visual tests:

```bash
npm run test:e2e
```

Run in UI mode for debugging:

```bash
npm run test:e2e:ui
```

View the HTML report:

```bash
npm run test:e2e:report
```

### Pre-Commit Checklist

Before opening a pull request, verify:

- [ ] Backend tests pass (`pytest tests/`).
- [ ] Frontend lint passes (`npm run lint`).
- [ ] Frontend E2E tests pass (`npm run test:e2e`).
- [ ] New code has appropriate tests.
- [ ] Documentation is updated if behavior changes.
- [ ] No dead Markdown links or broken references.

---

## Contribution Workflow

1. **Open or find an issue.** Describe the bug, feature, or documentation gap.
2. **Create a branch** from `main` with a descriptive name.
3. **Make focused changes.** Keep pull requests small and single-purpose.
4. **Write tests** for new functionality and update existing tests as needed.
5. **Update documentation** for API changes, new features, or architecture decisions.
6. **Open a Pull Request** and fill in the template:
   - What changed
   - Why it changed
   - Related issue or ADR
   - Reviewer focus areas
7. **Address review feedback** and ensure CI checks pass.
8. **Merge** once approved by a maintainer.
9. **Version significant milestones.** Follow [Milestone Versioning](MILESTONE_VERSIONING.md): verify tests and documentation, commit, create an annotated semantic-version tag, push the commit, and push the tag. A milestone is incomplete until its tag is pushed.

### Documentation Contributions

For documentation-only changes, follow [`docs/CONTRIBUTING.md`](CONTRIBUTING.md):

- Use the correct folder (`docs/prd/`, `docs/adr/`, or `docs/` root).
- Update metadata headers and version numbers for substantive changes.
- Add a changelog entry for minor or major version bumps.
- Cross-reference related documents.

---

## Environment Variables

### Backend (`backend/.env`)

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

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000
```

See [`deployment.md`](deployment.md) for production-specific environment configuration.

---

## Getting Help

- Start with [`docs/README.md`](README.md) for documentation navigation.
- Review [`architecture.md`](architecture.md) for system design questions.
- Check [`deployment.md`](deployment.md) for operational questions.
- Open a GitHub issue for bugs, feature requests, or questions.
