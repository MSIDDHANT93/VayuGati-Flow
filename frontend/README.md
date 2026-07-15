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

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    TOP BAR                                │
│  System Health | City Info | Time | Alerts               │
├──────────┬──────────────────────────────┬────────────────┤
│ LEFT     │      MAIN AREA                │   RIGHT        │
│ PANEL    │  Interactive City Map          │   PANEL        │
│          │  - Intersection Markers       │                │
│ Camera   │  - Traffic Overlays           │ Traffic        │
│ Feed     │  - Real-time Updates          │ Intelligence   │
│          │                              │                │
│ YOLO     │                              │ Queue          │
│ Detections│                             │ Density        │
│          │                              │ LOS            │
│ Vehicle  │                              │ Risk           │
│ Counts   │                              │                │
│          │                              │ AI Reasoning   │
├──────────┴──────────────────────────────┴────────────────┤
│                    BOTTOM PANEL                            │
│  Historical Trends | Simulation Controls | Timeline       │
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
- **LeftPanel** - Camera feeds, YOLO detections, vehicle counts
- **RightPanel** - Traffic intelligence, AI reasoning
- **BottomPanel** - Historical trends, simulation controls
- **MainArea** - Interactive city map

### Panel Components

- **CameraFeed** - Live camera feeds with YOLO detection overlay
- **TrafficIntelligence** - Queue, density, speed, LOS, risk metrics
- **AIReasoning** - Fireworks AI explanations and recommendations
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
