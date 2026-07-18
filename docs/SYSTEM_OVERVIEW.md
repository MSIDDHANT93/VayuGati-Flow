# VayuGati Flow - System Overview

## Architecture

VayuGati Flow is a modular AI-powered traffic root cause analysis and decision support system. The architecture follows a pipeline pattern with independent, composable engines.

```
┌─────────────────────────────────────────────────────────────────┐
│                        MISSION CONTROL DASHBOARD                 │
│                    (React + TypeScript + TailwindCSS)             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         FASTAPI BACKEND                         │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   VISION      │    │   TRAFFIC        │    │   REASONING      │
│   ENGINE      │───▶│   INTELLIGENCE   │───▶│   ENGINE         │
│               │    │   ENGINE         │    │                  │
│ • YOLO        │    │ • Deterministic   │    │ • Fireworks AI   │
│ • Detections  │    │   Algorithms     │    │ • Explanations   │
│ • Vehicle     │    │ • Queue/Density   │    │ • Root Causes    │
│   Tracking    │    │ • LOS/Risk        │    │ • Recommendations│
└───────────────┘    └──────────────────┘    └──────────────────┘
        │                       │                       │
        └───────────────────────┴───────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DOMAIN MODELS LAYER                         │
│  (Intersection, Camera, VehicleDetection, TrafficSignal, etc.)  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Complete Pipeline Flow

```
1. INPUT: Camera Image / Vehicle Detections
   │
   ▼
2. VISION ENGINE (Optional)
   - YOLO object detection
   - Vehicle classification
   - Bounding box extraction
   - Speed estimation
   │
   ▼
3. TRAFFIC INTELLIGENCE ENGINE
   - Queue length calculation
   - Vehicle density calculation
   - Average speed calculation
   - Occupancy rate calculation
   - Congestion score calculation
   - Level of Service (LOS) determination
   - Risk score calculation
   │
   ▼
4. REASONING ENGINE
   - Congestion explanation generation
   - Root cause identification
   - Traffic recommendations
   - Confidence scoring
   │
   ▼
5. OUTPUT: Standardized API Response
   - Traffic metrics
   - AI insights
   - Recommendations
```

### API Flow

```
POST /api/v1/pipeline/demo
{
  "scenario": "morning_rush",
  "intersection_id": "INT-001",
  "camera_id": "CAM-001",
  "frame_id": "FRM-001"
}
│
├─▶ Load Demo Scenario (Vehicle Detections)
│
├─▶ Traffic Intelligence Engine
│   └─▶ Calculate deterministic metrics
│
├─▶ Reasoning Engine
│   └─▶ Generate AI insights
│
└─▶ Return Complete Analysis
```

## Engine Responsibilities

### Vision Engine
**Purpose:** Detect and classify vehicles from camera images

**Responsibilities:**
- Run YOLO inference on images
- Convert detections to VehicleDetection domain models
- Extract bounding boxes, confidence scores, vehicle types
- Estimate vehicle speeds (when possible)
- Handle YOLO unavailability with mock fallback

**Does NOT:**
- Calculate traffic metrics
- Determine congestion levels
- Generate recommendations

**Input:** Base64-encoded image
**Output:** VehicleDetection objects

### Traffic Intelligence Engine
**Purpose:** Calculate deterministic traffic metrics using HCM algorithms

**Responsibilities:**
- Calculate queue length
- Calculate vehicle density
- Calculate average speed
- Calculate occupancy rate
- Calculate congestion score
- Determine Level of Service (LOS)
- Calculate risk score
- Generate explanatory outputs

**Does NOT:**
- Use AI/ML for calculations
- Process images
- Generate recommendations
- Explain root causes

**Input:** VehicleDetection objects + domain models
**Output:** TrafficAnalysisResult with metrics

### Reasoning Engine
**Purpose:** Explain deterministic outputs and generate recommendations

**Responsibilities:**
- Explain congestion patterns
- Identify probable root causes
- Generate traffic recommendations
- Provide confidence scoring
- Generate natural language insights

**Does NOT:**
- Perform calculations
- Process images
- Override deterministic metrics
- Hallucinate data

**Input:** Traffic metrics from deterministic engine
**Output:** ReasoningResponse with insights

## MVP Scope

### In Scope (v0.2.0)
- Single intersection analysis
- 5 demo scenarios (Morning Rush, School Zone, Accident, Illegal Parking, Emergency)
- Deterministic traffic algorithms (HCM-based)
- YOLO computer vision integration
- Fireworks AI reasoning integration
- Mission Control Dashboard (React)
- End-to-end pipeline orchestration
- RESTful API with standardized responses

### Out of Scope (Future)
- Multi-intersection analysis
- Real-time video streaming
- Historical data storage
- User authentication
- Database persistence
- Geographic map integration
- Signal control automation
- Mobile applications

## API Endpoints

### Traffic Intelligence
- `POST /api/v1/traffic/analyze` - Analyze traffic with domain models

### Vision
- `POST /api/v1/vision/analyze` - Analyze image with YOLO

### Reasoning
- `POST /api/v1/reasoning/analyze` - Generate AI insights from metrics

### Pipeline
- `POST /api/v1/pipeline/demo` - Run end-to-end demo pipeline
- `GET /api/v1/pipeline/scenarios` - List available demo scenarios

## Technology Stack

### Backend
- **Framework:** FastAPI
- **Language:** Python 3.13+
- **Validation:** Pydantic v2
- **Computer Vision:** Ultralytics YOLO
- **AI Reasoning:** Fireworks AI (Llama 3 70B)
- **Testing:** Pytest

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **Build:** Vite

## Design Principles

1. **Modularity:** Each engine is independently deployable and testable
2. **Determinism:** Traffic calculations use proven algorithms (HCM)
3. **Type Safety:** Full TypeScript and Pydantic coverage
4. **API-First:** All functionality exposed via RESTful APIs
5. **Composability:** Engines can be combined in different pipelines
6. **Mock Fallbacks:** Graceful degradation when AI/CV unavailable

## Known Limitations

1. **Single Intersection:** MVP supports one intersection at a time
2. **No Persistence:** Data is not stored between requests
3. **Mock Vision:** YOLO requires model download and setup
4. **Mock AI:** Fireworks AI requires API key configuration
5. **No Real-time:** Demo scenarios use pre-configured data
6. **No Authentication:** API endpoints are currently public

## Demo Workflow

### Quick Start

1. Start Backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

2. Start Frontend:
```bash
cd frontend
npm install
npm run dev
```

3. Run Demo:
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

### Available Scenarios

1. **morning_rush** - High traffic volume during peak hours
2. **school_zone** - Reduced speed zone with pedestrian activity
3. **accident** - Traffic accident blocking lanes
4. **illegal_parking** - Vehicles illegally parked blocking traffic
5. **emergency_vehicle** - Emergency vehicle requiring right-of-way

## Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Test Coverage
- Traffic Algorithms: 27 tests
- Traffic Analysis Service: 13 tests
- Computer Vision Service: 9 tests
- Reasoning Service: 11 tests
- API Integration: 24 tests
- **Total: 84 tests**

## Future Enhancements

1. **Multi-Intersection:** Scale to city-wide monitoring
2. **Real-time Streaming:** WebSocket support for live updates
3. **Database Integration:** PostgreSQL for historical data
4. **Map Integration:** Interactive city map with real-time overlays
5. **Signal Control:** Automated signal timing optimization
6. **Mobile App:** iOS and Android applications
7. **Advanced AI:** Custom fine-tuned models for specific cities
