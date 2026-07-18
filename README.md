# 🚦 VayuGati Flow

## AI Digital Twin for Urban Traffic Management

VayuGati Flow is an AI-powered Digital Twin that analyzes traffic congestion, identifies root causes, simulates interventions, and recommends optimized traffic management strategies before deployment in the real world.

---

# 🌍 The Problem

Urban traffic congestion leads to:

- Increased travel time
- Fuel wastage
- Air pollution
- Delayed emergency response
- Economic losses
- Inefficient traffic planning

Current systems mainly react after congestion has already formed.

---

# 💡 Our Solution

VayuGati Flow creates a digital twin of an intersection where AI agents:

1. Observe traffic
2. Detect congestion
3. Identify root causes
4. Simulate interventions
5. Recommend the best strategy

---

# 🧠 AI Pipeline

Traffic Camera / Simulation

↓

Computer Vision (YOLO)

↓

Traffic Intelligence Engine (Deterministic HCM Algorithms)

↓

AI Reasoning Engine (Fireworks AI)

↓

Interactive Dashboard

---

# 🚀 Quick Start Demo

## Prerequisites

- Python 3.13+
- Node.js 18+
- npm

## Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend will run on `http://localhost:8000`

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

## Running the Demo

1. Open `http://localhost:3000` in your browser
2. Select a scenario from the dropdown in the top bar:
   - **Morning Rush** - High traffic volume during peak hours
   - **School Zone** - Reduced speed zone with pedestrian activity
   - **Accident** - Traffic accident blocking lanes
   - **Illegal Parking** - Vehicles illegally parked blocking traffic
   - **Emergency Vehicle** - Emergency vehicle requiring right-of-way
3. The dashboard will automatically load the scenario data and display:
   - Vehicle detections
   - Traffic metrics (queue, density, speed, LOS, risk)
   - AI-generated explanations and recommendations

## API Demo

You can also test the pipeline directly via API:

```bash
curl -X POST http://localhost:8000/api/v1/pipeline/demo \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "morning_rush",
    "intersection_id": "INT-001",
    "camera_id": "CAM-001",
    "frame_id": "FRM-001"
  }'
```

List available scenarios:

```bash
curl http://localhost:8000/api/v1/pipeline/scenarios
```

---

# 🤖 AI Agents

- **Vision Agent** - YOLO computer vision for vehicle detection
- **Traffic Intelligence Agent** - Deterministic HCM-based traffic analysis
- **Reasoning Agent** - Fireworks AI for root cause analysis and recommendations

---

# ⚡ AMD GPU Usage

AMD GPUs accelerate:

- Computer Vision
- Object Detection
- Vehicle Tracking
- AI Inference
- Traffic Analytics
- Simulation Workloads

---

# 🛠 Tech Stack

## Backend
- **Framework:** FastAPI
- **Language:** Python 3.13+
- **Validation:** Pydantic v2
- **Computer Vision:** Ultralytics YOLO
- **AI Reasoning:** Fireworks AI (Llama 3 70B)
- **Testing:** Pytest

## Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **Build:** Vite

---

# 📊 Demo Scenarios

## Morning Rush
- High traffic volume (48 vehicles)
- Moderate congestion
- LOS D
- Risk score: 0.55

## School Zone
- Reduced speeds (20 km/h)
- Many stopped vehicles
- Pedestrian activity
- LOS E

## Accident
- Blocked lanes
- Emergency vehicle present
- Severe congestion
- LOS F
- High risk score

## Illegal Parking
- Vehicles blocking travel lanes
- Moderate congestion
- LOS D

## Emergency Vehicle
- Emergency vehicle in traffic
- Requires right-of-way
- Elevated risk score

---

# 📚 Documentation

For the complete documentation index, see [`docs/README.md`](docs/README.md).

- [System Overview](docs/SYSTEM_OVERVIEW.md) - Complete architecture and data flow
- [PRD sections](docs/prd/) - Product requirements and strategic documentation
- [VIA](docs/via/) - VayuGati Intelligence Architecture
- [Testing](docs/testing/playwright.md) - Playwright visual testing setup

---

# 🧪 Testing

Backend:
```bash
cd backend
pytest tests/ -v
```

Frontend (Chromium):
```bash
cd frontend
npm run test:e2e
```

Test Coverage: 149 backend tests passing, 10 Playwright suites passing

---

# 🚀 Roadmap

- [x] Digital Twin MVP
- [x] Computer Vision Integration
- [x] AI Reasoning Integration
- [x] Mission Control Dashboard
- [x] Demo Scenarios
- [ ] Real-time Video Streaming
- [ ] Multi-Intersection Analysis
- [ ] Historical Data Storage
- [ ] Signal Control Automation
- [ ] City-scale Expansion

---

## Status

✅ **Demo Ready** - v0.2.0

---
