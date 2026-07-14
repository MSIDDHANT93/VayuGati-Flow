# Traffic Analysis Algorithms Documentation

## Overview

This document describes the deterministic algorithms used in the VayuGati Flow traffic analysis pipeline. All algorithms are based on standard traffic engineering principles from the Highway Capacity Manual (HCM) and Transportation Research Board (TRB).

**No AI, no ML, no LLM - pure deterministic calculations.**

---

## Algorithm Pipeline

```
Request (Vehicle Detections + Parameters)
    ↓
Queue Length Calculation
    ↓
Vehicle Density Calculation
    ↓
Average Speed Calculation
    ↓
Occupancy Rate Calculation
    ↓
Congestion Score Calculation
    ↓
Level of Service (LOS) Calculation
    ↓
Risk Score Calculation
    ↓
Explanatory Output Generation
    ↓
Response
```

---

## 1. Queue Length Calculation

### Purpose
Estimate the physical length of traffic queues based on stopped vehicles.

### Algorithm
```
1. Count vehicles with speed < 5 km/h (considered stopped)
2. Multiply by average vehicle spacing (7 meters)
3. Normalize by lane count
4. Cap at lane length
```

### Formula
```
queue_length = (stopped_vehicles * 7) / lane_count
queue_length = min(queue_length, lane_length_meters)
```

### Parameters
- `stopped_vehicles`: Count of vehicles with speed < 5 km/h
- `lane_count`: Number of lanes at intersection
- `lane_length_meters`: Length of lane in meters
- `avg_vehicle_spacing`: 7 meters (constant)

### Output
- Queue length in meters (0 to lane_length_meters)

### Reference
Based on standard vehicle spacing including safety distance in urban environments.

---

## 2. Vehicle Density Calculation

### Purpose
Calculate the density of vehicles per kilometer of road.

### Algorithm
```
1. Count total vehicles in analysis window
2. Calculate total road length (lanes × length)
3. Density = vehicles / road_length_km
```

### Formula
```
total_road_length_km = (lane_count × lane_length_meters) / 1000
density = total_vehicles / total_road_length_km
```

### Parameters
- `total_vehicles`: Count of all vehicle detections
- `lane_count`: Number of lanes
- `lane_length_meters`: Length of lane in meters

### Output
- Vehicle density in vehicles per km

### Reference
Standard density calculation used in traffic flow theory.

---

## 3. Average Speed Calculation

### Purpose
Calculate the arithmetic mean speed of all vehicles.

### Algorithm
```
1. Filter vehicles with valid speed data (> 0)
2. Calculate arithmetic mean
```

### Formula
```
valid_speeds = [v.speed_kmh for v in vehicles if v.speed_kmh is not None and v.speed_kmh > 0]
average_speed = sum(valid_speeds) / len(valid_speeds)
```

### Parameters
- `vehicle_detections`: List of vehicle detections with speed data

### Output
- Average speed in km/h (0 if no valid data)

### Reference
Standard arithmetic mean calculation for speed aggregation.

---

## 4. Occupancy Rate Calculation

### Purpose
Calculate lane occupancy rate based on capacity utilization.

### Algorithm
```
1. Calculate current flow rate (vehicles per hour)
2. Occupancy = flow_rate / (capacity × lane_count)
3. Cap at 1.0 (100%)
```

### Formula
```
vehicles_per_hour = vehicles_per_minute × 60
total_capacity = capacity_vehicles_per_hour × lane_count
occupancy = vehicles_per_hour / total_capacity
occupancy = min(occupancy, 1.0)
```

### Parameters
- `vehicles_per_minute`: Vehicle count in analysis window
- `lane_count`: Number of lanes
- `capacity_vehicles_per_hour`: Capacity per lane in vehicles/hour

### Output
- Occupancy rate (0-1)

### Reference
Based on Highway Capacity Manual capacity utilization principles.

---

## 5. Congestion Score Calculation

### Purpose
Calculate a composite congestion severity score (0-1, higher is worse).

### Algorithm
```
1. Calculate speed factor: (1 - speed/free_flow_speed)
2. Calculate density factor: normalized density (0-1 scale, >150 veh/km = 1)
3. Calculate queue factor: queue_length / lane_length
4. Weighted average: 0.4×speed + 0.3×density + 0.3×queue
```

### Formula
```
speed_factor = max(0, 1 - speed/free_flow_speed)
density_factor = min(1, density / 150)
queue_factor = queue_length / lane_length_meters
congestion_score = 0.4×speed_factor + 0.3×density_factor + 0.3×queue_factor
congestion_score = min(congestion_score, 1.0)
```

### Parameters
- `density`: Vehicle density in vehicles per km
- `speed`: Average speed in km/h
- `free_flow_speed`: Free flow speed in km/h
- `queue_length`: Queue length in meters
- `lane_length_meters`: Lane length in meters

### Weights
- Speed factor: 40% (primary indicator of congestion)
- Density factor: 30% (secondary indicator)
- Queue factor: 30% (impact indicator)

### Output
- Congestion score (0-1)

### Reference
Weighted composite index based on HCM congestion metrics.

---

## 6. Level of Service (LOS) Calculation

### Purpose
Calculate Highway Capacity Manual Level of Service (LOS) rating.

### Algorithm
Based on HCM 6th Edition urban street LOS criteria:

| LOS | Speed Ratio | Density (veh/km/ln) | Description |
|-----|-------------|---------------------|-------------|
| A   | > 90%       | < 7                 | Free flow |
| B   | > 70%       | < 12                | Reasonably free flow |
| C   | > 50%       | < 18                | Stable flow |
| D   | > 40%       | < 26                | Approaching unstable |
| E   | > 30%       | < 35                | Unstable flow |
| F   | ≤ 30%       | > 35                | Forced flow / breakdown |

### Formula
```
speed_ratio = speed / free_flow_speed

if speed_ratio < 0.3 or density > 35:
    return LOS_F
elif speed_ratio < 0.4 or density > 26:
    return LOS_E
elif speed_ratio < 0.5 or density > 18:
    return LOS_D
elif speed_ratio < 0.7 or density > 12:
    return LOS_C
elif speed_ratio < 0.9 or density > 7:
    return LOS_B
else:
    return LOS_A
```

### Parameters
- `density`: Vehicle density in vehicles per km
- `speed`: Average speed in km/h
- `free_flow_speed`: Free flow speed in km/h

### Output
- Level of Service rating (LOS_A through LOS_F)

### Reference
Highway Capacity Manual 6th Edition, Urban Street LOS methodology.

---

## 7. Risk Score Calculation

### Purpose
Calculate operational risk score (0-1, higher is worse).

### Algorithm
```
1. Congestion risk: congestion_score × 0.5
2. Queue risk: normalized queue length × 0.3
3. Stopped vehicle risk: stopped_ratio × 0.15
4. Emergency vehicle impact: emergency_count × 0.05
5. Sum weighted factors
```

### Formula
```
queue_risk = min(1, queue_length / 100)
emergency_risk = min(1, emergency_count × 0.2)
risk_score = 0.5×congestion_score + 0.3×queue_risk + 0.15×stopped_ratio + 0.05×emergency_risk
risk_score = min(risk_score, 1.0)
```

### Parameters
- `congestion_score`: Congestion score (0-1)
- `queue_length`: Queue length in meters
- `stopped_vehicle_ratio`: Ratio of stopped vehicles (0-1)
- `emergency_vehicles`: Count of emergency vehicles

### Weights
- Congestion: 50% (primary risk factor)
- Queue: 30% (secondary risk factor)
- Stopped vehicles: 15% (tertiary risk factor)
- Emergency vehicles: 5% (special circumstance)

### Output
- Risk score (0-1)

### Reference
Weighted risk assessment based on traffic safety principles.

---

## 8. Supporting Functions

### Stopped Vehicle Ratio
```
stopped_ratio = stopped_vehicles / total_vehicles
```
- Vehicles with speed < 5 km/h are considered stopped

### Emergency Vehicle Count
```
emergency_count = count of vehicles with type = "emergency"
```

### Congestion Explanation Generation
Generates human-readable explanations based on congestion score ranges:
- < 0.2: Free flow
- 0.2-0.4: Light congestion
- 0.4-0.6: Moderate congestion
- 0.6-0.8: Heavy congestion
- > 0.8: Severe congestion

### LOS Explanation Generation
Maps LOS ratings to descriptive text based on HCM definitions.

### Risk Factor Identification
Identifies risk factors based on thresholds:
- Congestion score > 0.7
- Queue length > 50m
- Stopped ratio > 0.5
- Emergency vehicle presence

---

## Assumptions and Limitations

### Assumptions
1. **Analysis Window**: Assumes 1-minute analysis window for flow calculations
2. **Vehicle Spacing**: Uses 7m average spacing for queue calculations
3. **Stopped Threshold**: Vehicles < 5 km/h are considered stopped
4. **Capacity**: Uses provided capacity values (typically 1800 veh/h/ln)
5. **Free Flow Speed**: Uses provided free flow speed (typically 60 km/h)

### Limitations
1. **No Historical Data**: Does not use historical baselines for comparison
2. **No Weather Adjustment**: Does not account for weather conditions
3. **No Incident Detection**: Cannot detect specific incidents (accidents, etc.)
4. **No Signal Timing**: Does not optimize signal timing
5. **Single Intersection**: Designed for single intersection analysis

---

## References

1. **Highway Capacity Manual 6th Edition**, Transportation Research Board, 2010
2. **Traffic Flow Theory**, Transportation Research Board, 2011
3. **Fundamentals of Traffic Engineering**, ITE, 2019

---

## Version History

- **v1.0** (2024-01-01): Initial implementation of deterministic traffic analysis algorithms
