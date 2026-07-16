# VayuGati Flow - Mission Control Dashboard

Premium Digital Twin dashboard for traffic root cause analysis and decision support.

## Tech Stack

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **TailwindCSS** - Styling
- **Vite** - Build Tool
- **Recharts** - Data Visualization
- **Lucide React** - Icons
- **Axios** - API Client
- **MapLibre GL** - Operational GIS map (open-source, no API key required)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    TOP BAR                                │
│  System Health | City Info | Time | Alerts               │
├──────────┬──────────────────────────────┬────────────────┤
│ LEFT     │      MAIN AREA                │   RIGHT        │
│ PANEL    │  Operational Map (MapLibre)   │   PANEL        │
│          │  - Roads / Intersections      │                │
│ Camera   │  - Cameras / Incidents        │ Confidence     │
│ Feed     │  - Layer Controls             │ Indicators     │
│          │  - Intersection Panel         │                │
│ Connector│                              │ Traffic        │
│ Status   │                              │ Intelligence   │
│          │                              │                │
│ YOLO     │                              │ AI Reasoning   │
│ Detections│                             │                │
│ Vehicle  │                              │ Decision       │
│ Counts   │                              │ Impact (Sim)   │
├──────────┴──────────────────────────────┴────────────────┤
│                    BOTTOM PANEL                            │
│  Mission Pipeline Timeline | Scenario Timeline | Trends   │
└─────────────────────────────────────────────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Components

### Layout Components

- **TopBar** - System status, city info, time, alerts
- **LeftPanel** - Camera feed, connector status, YOLO detections, vehicle counts
- **RightPanel** - Confidence indicators, traffic intelligence, AI reasoning, decision impact
- **BottomPanel** - Mission pipeline timeline, scenario timeline, historical trends
- **MainArea** - Operational map orchestration (layers, intersection selection, alerts)

### Map Components (`components/map`)

- **OperationalMap** - MapLibre GL canvas rendering roads, intersections, cameras and incidents. Intersection color reflects live congestion score for the active node.
- **LayerControls** - GIS-style toggles for Traffic, Cameras, Incidents, Weather, Construction, PM GatiShakti, Emergency Assets (last four are placeholder/extensibility layers, disabled by default).
- **IntersectionPanel** - Operational detail panel shown when an intersection marker is clicked (queue, LOS, risk, vehicle count, camera status, simulation status). Falls back to camera-only view for non-live (mock) intersections.

GIS reference data (intersection/camera/incident coordinates, road network, connector statuses) lives in `src/data/gisData.ts`. The backend has no geospatial endpoints, so these coordinates are a stable frontend-only digital-twin layer; live operational metrics for the primary intersection still come from the real pipeline API.

### Panel Components

- **CameraFeed** - Live camera feeds with YOLO detection overlay
- **ConnectorStatusPanel** - Plug-and-play connector/integration status (CCTV, Traffic Engine, AI Reasoning, Weather, PM GatiShakti, Satellite, IoT, ANPR)
- **MissionTimeline** - Operational pipeline stages (Image → YOLO → Traffic Intelligence → AI Reasoning → Simulation → Commander Decision) with per-stage latency/confidence
- **ConfidenceIndicators** - Confidence bars for Vision, Traffic, Reasoning, Simulation and Overall Mission
- **TrafficIntelligence** - Queue, density, speed, LOS, risk metrics
- **AIReasoning** - Fireworks AI explanations and recommendations
- **DecisionImpact** - Animated before/after simulation comparison (queue, speed, LOS, risk) with implementation confidence
- **HistoricalTrends** - Time-series data visualization

## API Integration

The frontend connects to the backend FastAPI services:

- **Traffic Analysis API** - `/api/v1/traffic/analyze`
- **Vision API** - `/api/v1/vision/analyze`
- **Reasoning API** - `/api/v1/reasoning/analyze`

## Design Principles

- **Dark Theme** - Mission control aesthetic
- **High Information Density** - Enterprise-grade UI
- **Minimal Animations** - Professional appearance
- **Reusable Components** - Modular architecture
- **Type Safety** - Full TypeScript coverage
- **Separation of Concerns** - Frontend only orchestrates display; Vision, Traffic Intelligence, Reasoning and Simulation remain independent backend services

## Development

```bash
# Development
npm run dev

# Build
npm run build

# Preview
npm run preview

# Lint
npm run lint
```

## License

MIT
