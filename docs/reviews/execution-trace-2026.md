---
title: VayuGati Flow — End-to-End Execution Trace
created: 2026-07-20
author: Devin
status: Baseline
purpose: Document the baseline execution path from frontend scenario selection through backend analysis to dashboard rendering.
---

# VayuGati Flow — End-to-End Execution Trace

This trace covers the **current demo execution path**: a user selects a scenario in the Mission Control dashboard, the frontend invokes the pipeline API, the backend analyzes synthetic detections, and the UI refreshes.

## Important Context

The scenario flow is **not a live vision pipeline** today:

- The UI invokes `POST /api/v1/pipeline/demo`.
- The backend loads a predefined synthetic scenario.
- The demo route **skips YOLO inference** and sets `vision_inference_time_ms` to `0.0`.
- It does run deterministic traffic analytics and AI reasoning (Fireworks if configured; mock fallback otherwise).

This is visible in `@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\routers\pipeline.py:71-105`.

---

# 1. Startup State Before Selection

`App` owns the global dashboard state:

- `pipelineData: null`
- `loading: true`
- `error: null`
- `currentScenario: "morning_rush"`
- `missionLog: []`

`App` runs `loadPipelineData()` once on initial mount and on every `currentScenario` change. Therefore, the initial page load follows the exact same pipeline as a later selection. `@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\App.tsx:10-24`

```text
App mounts
  └─ useEffect([currentScenario])
      └─ loadPipelineData()
          └─ POST /api/v1/pipeline/demo for "morning_rush"
```

---

# 2. Frontend Scenario Selection Trace

## 2.1 User changes the `<select>`

The scenario selector is rendered by `MissionStatus`. It has five hard-coded valid options and invokes its supplied callback with the selected value:

```text
<select onChange>
  └─ onScenarioChange(e.target.value)
```

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\components\mission\MissionStatus.tsx:17-23`  
`@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\components\mission\MissionStatus.tsx:44-57`

The selector is disabled while `loading === true`. This prevents changing scenarios during an active request.

## 2.2 Callback reaches `App`

`App` passes React’s state setter `setCurrentScenario` down through `LeftPanel` as `onScenarioChange`.

```text
MissionStatus
  → LeftPanel.onScenarioChange
  → App.setCurrentScenario
```

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\App.tsx:72-78`  
`@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\components\layout\LeftPanel.tsx:13-29`

## 2.3 State change triggers the fetch effect

React updates `currentScenario`, rerenders `App`, then runs this effect:

```text
useEffect([currentScenario])
  → loadPipelineData()
```

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\App.tsx:21-24`

## 2.4 `loadPipelineData()` enters loading state

`loadPipelineData()` performs the following in order:

1. `setLoading(true)`
2. `setError(null)`
3. Calls `pipelineApi.runDemo(...)`
4. If response is successful:
   - `setPipelineData(response.data)`
5. Otherwise:
   - `setError("Failed to load pipeline data")`
6. On thrown transport/API error:
   - `setError("Error connecting to backend")`
7. Always:
   - `setLoading(false)`

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\App.tsx:38-58`

The request currently always submits these fixed identifiers:

```text
scenario         = selected scenario
intersection_id  = INT-001
camera_id        = CAM-001
frame_id         = FRM-001
```

No custom lane count, lane length, free-flow speed, or capacity is provided, so backend defaults apply.

---

# 3. Frontend API Request Trace

## 3.1 `pipelineApi.runDemo`

`pipelineApi.runDemo` serializes the `PipelineRequest` and posts it to:

```text
POST /api/v1/pipeline/demo
Content-Type: application/json
```

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\api\pipeline.ts:4-38`

Conceptual payload:

```json
{
  "scenario": "accident",
  "intersection_id": "INT-001",
  "camera_id": "CAM-001",
  "frame_id": "FRM-001"
}
```

## 3.2 Axios client behavior

`apiClient` uses:

- Base URL: `VITE_API_BASE_URL`, defaulting to `http://localhost:8000`
- Timeout: 30 seconds
- JSON content type
- Response interceptor that creates an enriched client error with HTTP status context

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\api\client.ts:1-28`

```text
pipelineApi.runDemo()
  → apiClient.post(...)
      → Axios serializes JSON
      → Browser performs HTTP request
      → FastAPI receives it
```

---

# 4. Backend Request, Validation, and Routing

## 4.1 FastAPI app and router registration

`main.py` creates the FastAPI app and mounts the pipeline router at the configured API prefix, default `/api/v1`.

```text
/api/v1 + /pipeline + /demo
= POST /api/v1/pipeline/demo
```

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\main.py:6-28`  
`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\config.py:6-28`

## 4.2 Pydantic request validation

FastAPI parses and validates the JSON against `PipelineRequest`.

Validation/defaults:

| Field | Constraint/default |
|---|---|
| `scenario` | required string |
| `intersection_id` | `INT-001` |
| `camera_id` | `CAM-001` |
| `frame_id` | `FRM-001` |
| `lane_count` | `4`, range 1–12 |
| `lane_length_meters` | `100.0`, range 10–1000 |
| `free_flow_speed_kmh` | `60.0`, range 20–120 |
| `capacity_vehicles_per_hour` | `1800`, range 500–3000 |

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\routers\pipeline.py:19-29`

Invalid field types or bounds fail before the service layer with FastAPI’s validation response.

## 4.3 Dependency injection creates a pipeline service

FastAPI calls `get_pipeline_service()` for the request:

```text
run_demo_pipeline(...)
  → Depends(get_pipeline_service)
  → PipelineService()
```

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\routers\pipeline.py:14-16`  
`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\routers\pipeline.py:109-113`

`PipelineService.__init__()` instantiates:

- `ComputerVisionService`
- deterministic `TrafficAnalysisService`
- `ReasoningService`

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\services\pipeline_service.py:38-45`

**Nuance:** `get_pipeline_service()` is not cached. A new pipeline service is constructed per demo request. This also instantiates `ComputerVisionService`, which may attempt to load YOLO even though the demo flow bypasses the Vision stage.

---

# 5. Backend Demo Pipeline Trace

## 5.1 Router invokes centralized error wrapper

The route calls:

```text
execute_service(
  operation = lambda: _build_pipeline_response(request, service),
  client error = "Pipeline execution failed"
)
```

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\routers\pipeline.py:129-134`

`execute_service()`:

1. Executes the operation.
2. Wraps a successful result in `APIResponse(success=True, data=..., errors=None)`.
3. Re-raises expected `HTTPException`s.
4. Logs unexpected exceptions with a traceback.
5. Converts unexpected exceptions to a generic HTTP 500.

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\utils\responses.py:18-52`

## 5.2 Scenario registry lookup

`_build_pipeline_response()` calls:

```text
get_scenario(request.scenario)
  → DEMO_SCENARIOS.get(scenario_name)
```

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\routers\pipeline.py:62-75`  
`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\services\demo_scenarios.py:294-306`

The registry contains:

```text
morning_rush      → MorningRushScenario
school_zone       → SchoolZoneScenario
accident          → AccidentScenario
illegal_parking   → IllegalParkingScenario
emergency_vehicle → EmergencyVehicleScenario
```

If no match exists:

```text
raise HTTPException(400, "Unknown scenario: ...")
```

This response is not turned into a 500 because `execute_service()` explicitly re-raises `HTTPException`.

## 5.3 Scenario creates synthetic `VehicleDetection` records

The selected `DemoScenario.get_vehicle_detections(camera_id, intersection_id, frame_id)` creates domain models, not raw dictionaries.

Examples:

- `MorningRushScenario`: 40 cars + 8 trucks.
- `SchoolZoneScenario`: 15 moving cars + 10 stopped cars.
- `AccidentScenario`: 20 stopped cars + 1 emergency vehicle.
- `IllegalParkingScenario`: 12 moving cars + 5 stopped cars.
- `EmergencyVehicleScenario`: 25 cars + 1 emergency vehicle.

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\services\demo_scenarios.py:26-77`  
`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\services\demo_scenarios.py:134-184`  
`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\services\demo_scenarios.py:241-301`

Each `VehicleDetection` includes:

```text
detection_id
frame_id
camera_id
intersection_id
vehicle_type
confidence / confidence_level
normalized bounding box
speed_kmh
direction_degrees
detection_timestamp
```

The domain contract is defined in `@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\models\vehicle_detection.py:26-81`.

---

# 6. Pipeline Service Trace

The router calls:

```text
PipelineService.analyze_from_detections(...)
```

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\routers\pipeline.py:77-86`  
`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\services\pipeline_service.py:122-188`

This is the **demo path**, so it deliberately sets:

```text
vision_result = None
```

No image decoding, no YOLO inference, no detection conversion occurs in this request path.

## 6.1 Synthetic operational context assembly

`_build_traffic_request_from_detections()` constructs:

- `Intersection`
- `Camera`
- `TrafficSignal`
- the provided synthetic `VehicleDetection` list
- request/default traffic parameters

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\services\pipeline_service.py:257-319`

It creates a fixed demo context:

```text
intersection: signalized, active, New York City coordinates
camera:       online, Full HD, 30 FPS
signal:       northbound, green, 120-second cycle
```

This context is not derived from the frontend GIS map, which uses Bengaluru coordinates. The frontend map and backend domain context are currently independent demo representations.

## 6.2 `TrafficAnalysisRequest`

The pipeline builds `TrafficAnalysisRequest`, which validates:

- the nested domain models,
- lane count,
- lane length,
- free-flow speed,
- capacity.

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\schemas\traffic_analysis.py:22-102`

---

# 7. Deterministic Traffic Intelligence Trace

`PipelineService` calls:

```text
TrafficAnalysisService.analyze(traffic_request)
```

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\services\pipeline_service.py:154-164`  
`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\services\traffic_analysis_service.py:33-112`

The service performs the following function calls in order:

```text
calculate_queue_length()
calculate_vehicle_density()
calculate_average_speed()
calculate_occupancy_rate()
calculate_congestion_score()
calculate_level_of_service()
calculate_stopped_vehicle_ratio()
count_emergency_vehicles()
calculate_risk_score()
generate_congestion_explanation()
generate_los_explanation()
identify_risk_factors()
```

## 7.1 Algorithm sequence

```text
List[VehicleDetection]
  │
  ├─ calculate_queue_length()
  ├─ calculate_vehicle_density()
  ├─ calculate_average_speed()
  ├─ calculate_occupancy_rate()
  │
  ├─ calculate_congestion_score()
  ├─ calculate_level_of_service()
  ├─ calculate_stopped_vehicle_ratio()
  ├─ count_emergency_vehicles()
  ├─ calculate_risk_score()
  │
  ├─ generate_congestion_explanation()
  ├─ generate_los_explanation()
  └─ identify_risk_factors()
       │
       ▼
TrafficAnalysisResult
```

## 7.2 Exact algorithm behavior

| Function | Current calculation |
|---|---|
| `calculate_queue_length` | Counts vehicles with `speed_kmh < 5`, multiplies by 7m, divides by lane count, caps at lane length. |
| `calculate_vehicle_density` | `vehicles / ((lane_count × lane_length_meters) / 1000)`. |
| `calculate_average_speed` | Arithmetic mean of available `speed_kmh` values. |
| `calculate_occupancy_rate` | Assumes a one-minute analysis window; converts count to vehicles/hour, divides by `capacity × lane_count`, caps at `1.0`. |
| `calculate_congestion_score` | `0.4 × speed_factor + 0.3 × density_factor + 0.3 × queue_factor`. |
| `calculate_level_of_service` | Threshold classification using speed ratio and density. |
| `calculate_risk_score` | Weighted congestion, queue, stopped-vehicle ratio, emergency presence. |
| explanation functions | Deterministic natural-language templates. |

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\utils\traffic_algorithms.py:14-210`  
`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\utils\traffic_algorithms.py:213-307`  
`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\utils\traffic_algorithms.py:310-433`

The output is a typed `TrafficAnalysisResult`:

```text
queue_length_meters
vehicle_density_vehicles_per_km
average_speed_kmh
occupancy_rate
congestion_score
level_of_service
risk_score
congestion_explanation
los_explanation
risk_factors
analysis_timestamp
total_vehicles_analyzed
```

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\schemas\traffic_analysis.py:105-145`

---

# 8. AI Reasoning Trace

## 8.1 Reasoning request assembly

The pipeline maps deterministic traffic output into `ReasoningRequest`:

```text
queue_length_meters
vehicle_density_vehicles_per_km
average_speed_kmh
occupancy_rate
congestion_score
level_of_service
risk_score
intersection_id
lane_count
total_vehicles
```

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\services\pipeline_service.py:166-179`  
`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\schemas\reasoning.py:7-39`

## 8.2 `ReasoningService.analyze_traffic()`

The reasoning service has two paths.

### Path A — Fireworks API key configured

```text
ReasoningService.analyze_traffic()
  → _build_prompt()
  → OpenAI-compatible Fireworks chat completion
  → _parse_response()
  → ReasoningResponse
```

The system prompt requires JSON-only output and says the model must not perform calculations. `@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\services\reasoning_service.py:60-99`

`_build_prompt()` includes the deterministic metrics, contextual identifiers, output schema, and constraints. `@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\services\reasoning_service.py:101-143`

`_parse_response()` strips markdown fences if present, parses JSON, and extracts expected fields. On parsing failure it returns default safe insights. `@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\services\reasoning_service.py:145-177`

### Path B — no Fireworks client/API key

```text
ReasoningService.analyze_traffic()
  → _generate_mock_response()
  → select template by congestion_score
  → ReasoningResponse(model_used="mock")
```

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\services\reasoning_service.py:46-59`  
`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\services\reasoning_service.py:179-212`

The output is:

```text
congestion_explanation
probable_root_causes[]
traffic_recommendations[]
confidence_score
reasoning_timestamp
model_used
```

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\schemas\reasoning.py:42-74`

---

# 9. Pipeline Response Assembly

The router flattens both service outputs into `PipelineResponse`.

Important fields:

```text
scenario
intersection_id
total_vehicles
vision_detections             = synthetic detection count
vision_inference_time_ms      = 0.0 for demo requests
traffic metrics
AI explanation, causes, recommendations, confidence
pipeline_duration_ms
```

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\routers\pipeline.py:88-106`

Then `execute_service()` wraps it:

```json
{
  "success": true,
  "timestamp": "UTC timestamp",
  "data": {
    "scenario": "accident",
    "intersection_id": "INT-001",
    "total_vehicles": 21,
    "vision_detections": 21,
    "vision_inference_time_ms": 0,
    "queue_length_meters": 35,
    "vehicle_density_vehicles_per_km": 52.5,
    "average_speed_kmh": 0,
    "occupancy_rate": 0.175,
    "congestion_score": 0.805,
    "level_of_service": "LOS_F",
    "risk_score": 0.72,
    "congestion_explanation": "...",
    "probable_root_causes": ["..."],
    "traffic_recommendations": ["..."],
    "ai_confidence": 0.8,
    "pipeline_duration_ms": 12.4
  },
  "errors": null
}
```

The response envelope contract is defined in `@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\schemas\common.py:8-25`.

---

# 10. Full Request Sequence Diagram

```text
User             MissionStatus        App              Axios             FastAPI Router
 │                     │                │                │                    │
 │ select scenario    │                │                │                    │
 ├───────────────────>│                │                │                    │
 │                    │ onChange()     │                │                    │
 │                    ├───────────────>│ setCurrentScenario()                 │
 │                    │                │                                      │
 │                    │                │ useEffect([currentScenario])         │
 │                    │                ├─ loadPipelineData()                  │
 │                    │                │  ├─ setLoading(true)                 │
 │                    │                │  └─ pipelineApi.runDemo()             │
 │                    │                │                │ POST /pipeline/demo │
 │                    │                │                ├─────────────────────>│
 │                    │                │                │                    │ validate PipelineRequest
 │                    │                │                │                    │ create PipelineService
 │                    │                │                │                    │ execute_service(...)
 │                    │                │                │                    │
 │                    │                │                │                    │ get_scenario()
 │                    │                │                │                    │ get_vehicle_detections()
 │                    │                │                │                    │
 │                    │                │                │       PipelineService
 │                    │                │                │                    │
 │                    │                │                │                    │ analyze_from_detections()
 │                    │                │                │                    │   ├─ build TrafficAnalysisRequest
 │                    │                │                │                    │   ├─ TrafficAnalysisService.analyze()
 │                    │                │                │                    │   └─ ReasoningService.analyze_traffic()
 │                    │                │                │                    │
 │                    │                │                │ APIResponse        │
 │                    │                │                │<─────────────────────┤
 │                    │                │ response.data  │                    │
 │                    │                │<───────────────┤                    │
 │                    │                │ setPipelineData(data)                │
 │                    │                │ setLoading(false)                    │
 │                    │                │                                      │
 │<──────────────────────────────────── dashboard rerenders ─────────────────┘
```

---

# 11. Dashboard Update Trace

Once `setPipelineData(response.data)` runs, React rerenders `App` and propagates the new object to all dashboard regions.

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\App.tsx:48-56`  
`@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\App.tsx:60-94`

## 11.1 Top bar

`TopBar` updates:

- selected scenario label,
- pipeline latency,
- system status,
- alert severity based on `risk_score`.

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\components\layout\TopBar.tsx:27-79`

## 11.2 Left panel

`MissionStatus` updates:

- status badges,
- latency,
- vehicle count,
- queue,
- speed,
- risk score,
- elevated-risk alert for `risk_score > 0.5`.

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\components\mission\MissionStatus.tsx:32-110`

## 11.3 Right panel

`SituationSummary` derives visual severity from `congestion_score`, then renders congestion, vehicles, speed, queue, and risk. `@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\components\mission\SituationSummary.tsx:13-62`

`DecisionSupport` calls `buildCoursesOfAction(pipelineData)` via `useMemo`. `@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\components\mission\DecisionSupport.tsx:15-20`

That function derives three deterministic Courses of Action:

1. Adaptive Signal Retiming.
2. Dynamic Lane Reallocation.
3. Upstream Demand Metering.

It uses backend recommendations as descriptions when available but computes expected queue/speed/risk deltas locally from pipeline metrics. `@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\lib\decisionIntelligence.ts:38-105`

The `DecisionCard` displays the highest-ranked course of action. Its `Simulate`, `Approve`, and `Evidence` actions only append local log records; they do not currently call a backend simulation endpoint. `@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\components\mission\DecisionSupport.tsx:22-64`

## 11.4 Bottom panel

`BottomPanel` updates:

- mission pipeline status,
- mission logs,
- static connector health panel.

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\components\layout\BottomPanel.tsx:16-53`

Separately, `App`’s `useEffect([pipelineData])` appends a `PIPELINE COMPLETE` entry, retaining the latest 50 entries. `@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\App.tsx:17-19`  
`@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\App.tsx:26-36`

---

# 12. Map Update Trace

`MainArea` passes the new `pipelineData` into `OperationalMap`. `@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\components\layout\MainArea.tsx:33-81`

`OperationalMap` retains one MapLibre instance in refs and responds to changed metric dependencies using effects.

## 12.1 Metrics that drive map rendering

```text
average_speed_kmh
congestion_score
queue_length_meters
```

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\components\map\OperationalMap.tsx:593-606`

## 12.2 Map update calls

```text
pipelineData changes
  ├─ speedFactorRef = clamp(average_speed_kmh / 30, 0.25, 2)
  ├─ congestionRef = congestion_score
  ├─ refreshVehicleTint()
  ├─ refreshRoadColor()
  └─ refreshQueueRing()
```

### `refreshVehicleTint()`
Changes animated vehicle marker color/glow:

- blue: low congestion
- amber: moderate congestion
- red/pink: high congestion

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\components\map\OperationalMap.tsx:489-503`

### `refreshRoadColor()`
Updates the three traffic road layers:

```text
traffic-road-glow
traffic-road-soft
traffic-road-core
```

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\components\map\OperationalMap.tsx:505-536`

### `refreshQueueRing()`
Resizes and recolors the queue ring at the primary intersection:

```text
diameter = clamp(queue_length_meters × 0.9, 0, 120)
```

`@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\components\map\OperationalMap.tsx:538-550`

### `refreshIntersectionStyles()`
Updates the `INT-001` marker color from `congestion_score` and marks the selected intersection. `@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\components\map\OperationalMap.tsx:552-570`

## 12.3 Map limitations in the current flow

- Map vehicles are visual simulation markers created from base-map road geometry, not backend detections.
- Vehicle count from the pipeline does not change the number of animated map vehicles; exactly 80 markers are created.
- `MainArea` supplies `onSelectIntersection={() => {}}`, so clicking a marker currently has no state effect.
- The map uses frontend mock Bengaluru GIS data, while backend pipeline-created domain models use fixed New York City coordinates.

Map source and frontend GIS state: `@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\data\gisData.ts:1-66`  
Map marker click behavior: `@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\components\map\OperationalMap.tsx:263-275`

---

# 13. Error Trace

```text
API error / timeout / transport error
  → Axios interceptor rejects enriched Error
  → App.loadPipelineData().catch(...)
  → setError("Error connecting to backend")
  → setLoading(false)
  → TopBar shows CONNECTION LOST + retry button
  → MainArea overlays OPERATIONAL FEED UNAVAILABLE
  → RightPanel / BottomPanel show error states
```

Frontend request error enrichment: `@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\api\client.ts:13-25`  
Frontend catch behavior: `@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\App.tsx:48-56`  
Backend unexpected exception handling: `@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\utils\responses.py:46-52`

---

# 14. Extension Points

## Input and ingestion

- **Scenario providers:** Add a `DemoScenario` subclass and register it in `DEMO_SCENARIOS`. This is the fastest way to add an operational story or test condition.  
  `@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\services\demo_scenarios.py:14-23`  
  `@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\services\demo_scenarios.py:294-301`

- **Live camera ingestion:** `PipelineService.analyze_from_image()` already provides the intended Vision → Traffic → Reasoning orchestration seam.  
  `@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\services\pipeline_service.py:47-120`

- **Streaming:** Replace frontend request/response polling with WebSocket or SSE, preserving `PipelineResponse` as the event payload contract.

## Computer vision

- **Detector replacement:** `ComputerVisionService` is the adapter boundary for YOLO, another Ultralytics model, a remote inference service, or an edge inference gateway.  
  `@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\services\computer_vision_service.py:32-84`

- **Class mapping:** Extend `_convert_yolo_box_to_detection()` to map local classes or custom-trained models, including ambulance/emergency classes.  
  `@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\services\computer_vision_service.py:145-214`

- **Tracking/speed estimation:** Populate `track_id`, `speed_kmh`, `direction_degrees`, `is_stopped`, and `stop_duration_seconds` across video frames rather than only using single-frame detections.  
  `@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\models\vehicle_detection.py:43-55`

## Traffic intelligence

- **Metric algorithms:** Each metric is an independent function in `traffic_algorithms.py`, allowing calibration using local traffic studies or a different HCM methodology.  
  `@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\utils\traffic_algorithms.py:14-433`

- **Additional metrics:** Add travel time, delay, shockwave, turn movements, saturation flow, incident probability, emissions, or pedestrian safety metrics to `TrafficAnalysisResult`.  
  `@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\schemas\traffic_analysis.py:105-126`

- **Signal-aware analysis:** The data model already passes `TrafficSignal`; algorithms can begin using its phase/timing fields rather than treating it as contextual-only.

## Reasoning and decision intelligence

- **LLM provider/model:** `ReasoningService` isolates Fireworks/OpenAI-compatible integration. Provider, model, retry policy, structured output, and safety evaluation can be changed there.  
  `@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\services\reasoning_service.py:24-99`

- **Prompt/evaluation policy:** `_build_prompt()` is the prompt boundary. Add structured outputs, provenance, policy constraints, multilingual responses, or recommendation evaluation here.  
  `@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\app\services\reasoning_service.py:101-143`

- **Real simulation:** Replace frontend’s estimated course-of-action impacts with a backend `/simulation` endpoint that runs SUMO or another traffic simulator and returns before/after outcomes. Current frontend estimates are deterministic presentation logic.  
  `@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\lib\decisionIntelligence.ts:42-105`

- **Human approval:** Replace local `handleApprove()` logging with a persisted, authenticated decision record and workflow.  
  `@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\components\mission\DecisionSupport.tsx:22-53`

## API and orchestration

- **New analysis paths:** Add dedicated endpoints for image pipeline execution, batch processing, video session creation, and historical queries alongside existing routers.  
  `@c:\Users\victus\CascadeProjects\VayuGati-Flow\backend\main.py:24-28`

- **Async queue:** Move CV and LLM calls behind Redis/RabbitMQ/Kafka workers when latency or throughput requires it. `PipelineService` is the natural orchestration boundary.

- **Persistence:** Store camera metadata, intersections, detections, analysis history, decisions, and simulation outcomes; current pipeline state is request-local.

## Frontend and map

- **Data-backed GIS:** Replace `MOCK_INTERSECTIONS`, `MOCK_CAMERAS`, and `MOCK_INCIDENTS` with API-loaded geospatial entities.  
  `@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\data\gisData.ts:33-87`

- **Intersection selection:** Wire `MainArea`’s empty `onSelectIntersection` callback to selected-intersection state and API queries.  
  `@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\components\layout\MainArea.tsx:43-48`

- **Live visualization:** Render actual detection positions, tracks, and trajectory data from a backend stream, instead of current map-generated markers.

- **Scenario catalog API:** Fetch scenario options from `/pipeline/scenarios` instead of maintaining hard-coded frontend options. `pipelineApi.listScenarios()` already exists.  
  `@c:\Users\victus\CascadeProjects\VayuGati-Flow\frontend\src\api\pipeline.ts:41-44`

---

# Trace Summary

```text
Scenario selection
  → setCurrentScenario
  → useEffect
  → loadPipelineData
  → Axios POST /api/v1/pipeline/demo
  → FastAPI validates PipelineRequest
  → PipelineService constructed
  → DemoScenario creates List[VehicleDetection]
  → PipelineService.analyze_from_detections
  → TrafficAnalysisService deterministic metrics
  → ReasoningService Fireworks or mock insights
  → PipelineResponse flattened
  → APIResponse envelope
  → Axios resolves
  → setPipelineData
  → App rerenders
  → KPI panels, decision card, mission log, and map visual state refresh
```

**Current architectural truth:** the product demonstrates a credible `synthetic detections → deterministic traffic analytics → AI explanation → operational dashboard` workflow. The live `image → YOLO → traffic analytics → AI reasoning` path exists in code but is not used by the scenario selector’s demo route.
