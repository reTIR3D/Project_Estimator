# Resource Planning Flow Diagram

## 📊 Complete Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROJECT ESTIMATION WORKFLOW                   │
└─────────────────────────────────────────────────────────────────┘

   SETUP              TEAM            EQUIPMENT        DELIVERABLES
┌─────────┐       ┌─────────┐       ┌─────────┐       ┌─────────┐
│ Project │  →    │ Build   │  →    │ Add     │  →    │ Config  │
│ Config  │       │ Team    │       │ Equip   │       │ Delivs  │
└─────────┘       └─────────┘       └─────────┘       └─────────┘
                                                             │
                                                             ↓
                                         ┌───────────────────────────────┐
                                         │   🎯 RESOURCE PLANNING (NEW)  │
                                         ├───────────────────────────────┤
                                         │  1. Calculate FTE by week     │
                                         │  2. Recommend team structure  │
                                         │  3. Generate reality warnings │
                                         │  4. Visualize staffing curve  │
                                         └───────────────────────────────┘
                                                             │
                                                             ↓
     WBS              RACI              COSTS            SUMMARY
┌─────────┐       ┌─────────┐       ┌─────────┐       ┌─────────┐
│ Work    │  →    │ Roles & │  →    │ Cost    │  →    │ Final   │
│ Break   │       │ Respons │       │ Breakdn │       │ Review  │
└─────────┘       └─────────┘       └─────────┘       └─────────┘
```

---

## 🔄 Resource Planning Details

### Input Flow
```
┌────────────────────────┐
│   DELIVERABLES LIST    │
│  (from previous step)  │
└───────────┬────────────┘
            │
            ↓
┌────────────────────────────────────────────┐
│  Extract: hours, discipline, dependencies  │
└───────────┬────────────────────────────────┘
            │
            ↓
     ┌──────┴────────┐
     │               │
     ↓               ↓
┌─────────┐    ┌─────────────┐
│ BY WEEK │    │ BY DISCIPLINE│
└────┬────┘    └──────┬──────┘
     │                 │
     └────────┬────────┘
              ↓
    ┌──────────────────┐
    │  FTE CALCULATION │
    └──────────────────┘
```

### FTE Calculation Logic
```
FOR each deliverable:
    base_hours = deliverable.adjusted_hours || deliverable.base_hours
    discipline = deliverable.discipline

FOR each week in project duration:
    hours_per_week = total_discipline_hours / duration_weeks

    // Apply reality factors
    IF week <= 3:
        hours_per_week *= 1.3  // Ramp-up penalty

    IF week % 4 == 0:
        hours_per_week *= 1.2  // Review cycle overhead

    // Calculate FTE (40 hrs/week, 85% utilization)
    billable_hours = 40 * 0.85 = 34
    fte = hours_per_week / billable_hours

    // Check for conflicts
    IF fte > 0 AND fte < 0.5:
        ADD warning: "Low utilization"

    IF fte != int(fte) AND fte > 1.0:
        ADD warning: "Fractional FTE"
```

### Team Recommendation Logic
```
total_hours = SUM(all deliverable hours)
overhead = project_size == "small" ? 1.1 :
           project_size == "medium" ? 1.15 :
           project_size == "large" ? 1.25

adjusted_hours = total_hours * overhead
base_fte = adjusted_hours / (duration_weeks * 40 * 0.85)

// Apply team template
IF total_hours < 1000:  // Small
    team = {
        "Lead Engineer": 0.2,
        "Senior Engineer": 1.0,
        "Engineer": 1.0
    }

ELSE IF total_hours < 5000:  // Medium
    team = {
        "Lead Engineer": 0.5,
        "Senior Engineer": 2.0,
        "Engineer": 3.0,
        "Junior Engineer": 1.0
    }

ELSE:  // Large
    team = {
        "Project Manager": 1.0,
        "Lead Engineer": 1.0,
        "Senior Engineer": 5.0,
        "Engineer": 8.0,
        "Junior Engineer": 3.0,
        "Document Control": 1.0
    }

// Calculate costs
FOR each role in team:
    cost = count * hourly_rate * 40 * duration_weeks
```

### Reality Check Logic
```
warnings = []

// Check for fractional FTEs
fractional = FILTER fte_requirements WHERE fte > 1.0 AND fte != int(fte)
IF fractional.length > 0:
    warnings.ADD({
        severity: "medium",
        title: "Fractional FTE Requirements",
        message: f"{fractional.length} periods require fractional staffing",
        recommendation: "Consider rounding up or adjusting timeline"
    })

// Check for staffing spikes
avg_fte = AVERAGE(fte_by_week)
peak = MAX(fte_by_week)
IF peak > avg_fte * 1.5:
    warnings.ADD({
        severity: "high",
        title: "Staffing Spike Detected",
        message: f"Peak week requires {peak} FTE (average: {avg_fte})",
        recommendation: "Consider leveling workload or temporary staff"
    })

// Check for low utilization
low_util = FILTER fte_requirements WHERE 0 < fte < 0.3
IF low_util.length > 5:
    warnings.ADD({
        severity: "low",
        title: "Low Utilization Periods",
        message: f"{low_util.length} periods with <30% utilization",
        recommendation: "Consider consolidating work"
    })

// Check team size
total_team = SUM(team_recommendations.count)
IF total_team > 15:
    warnings.ADD({
        severity: "medium",
        title: "Large Team Size",
        message: f"Recommended team: {total_team} people",
        recommendation: "Add 25% overhead for communication"
    })
```

---

## 📈 Visualization Flow

### Frontend Component Structure
```
<ResourcePlanning>
├─ Metadata Summary Cards
│  ├─ Project Size
│  ├─ Base FTE Required
│  ├─ Peak Staffing
│  └─ Average Staffing
│
├─ Reality Check Warnings
│  ├─ High Severity (🚨)
│  ├─ Medium Severity (⚠️)
│  └─ Low Severity (ℹ️)
│
├─ Team Recommendations
│  ├─ Role List
│  │  ├─ Count
│  │  ├─ Utilization
│  │  └─ Cost
│  ├─ Total Team Size
│  └─ Total Cost
│
└─ Resource Requirements
   ├─ View Toggle (Chart/Table)
   ├─ Chart View
   │  ├─ Combined FTE bar chart
   │  └─ Discipline breakdowns
   └─ Table View
      └─ Week-by-week details
```

### Data Flow
```
User configures deliverables
        ↓
Click "Next: Resource Planning"
        ↓
Component calls 3 API endpoints in parallel:
        ↓
┌───────┴───────┬───────────────┬──────────────────┐
│               │               │                  │
↓               ↓               ↓                  ↓
/calculate-fte  /recommend-team /reality-check
│               │               │
↓               ↓               ↓
requirements    recommendations warnings
│               │               │
└───────┬───────┴───────────────┘
        ↓
Render visualizations
        ↓
User reviews and makes decisions
        ↓
Either: Adjust deliverables (← back)
   Or: Proceed to WBS (→ next)
```

---

## 🎯 Decision Making Flow

```
View Resource Plan
        ↓
   ┌────┴────┐
   │ Warnings?│
   └────┬────┘
        │
   ┌────┴─────────────────┐
   │                      │
   NO                    YES
   ↓                      ↓
Accept Plan      ┌────────┴────────┐
   ↓             │                 │
Proceed to WBS   │   High/Medium?  │
                 │                 │
            ┌────┴────┐            │
            YES       NO           │
            ↓         ↓            │
        Must Address  Note & Proceed
            ↓
    ┌───────┴────────┐
    │                │
    ↓                ↓
Extend Timeline   Add Resources
    ↓                ↓
Adjust duration   Hire contractors
    ↓                ↓
Re-calculate      Re-calculate
    ↓                ↓
    └────────┬───────┘
             ↓
    Review updated plan
             ↓
       Accept & proceed
```

---

## 💾 Data Models

### ResourceRequirement
```typescript
{
  discipline: string        // "Process", "Mechanical", etc.
  week: number             // 1, 2, 3, ..., duration_weeks
  hours: number            // Adjusted hours for this week
  fte: number              // Calculated FTE (0.0 - N.N)
  conflicts: string[]      // Warnings specific to this period
}
```

### TeamRecommendation
```typescript
{
  role: string            // "Lead Engineer", "Senior Engineer", etc.
  count: number           // Number of people (can be fractional)
  utilization: number     // Target utilization % (60-95)
  cost: number            // Total cost for this role
}
```

### RealityWarning
```typescript
{
  type: string           // "fractional_fte", "staffing_spike", etc.
  severity: string       // "low", "medium", "high"
  title: string          // Display title
  message: string        // Warning message
  recommendation?: string // Action to take
  details?: string[]     // Additional context
}
```

---

## 🔌 API Endpoints

### POST /api/v1/resource-planning/calculate-fte
**Request:**
```json
{
  "deliverables": [
    {
      "discipline": "Process",
      "base_hours": 80,
      "adjusted_hours": 100
    }
  ],
  "duration_weeks": 12
}
```

**Response:**
```json
{
  "requirements": [
    {
      "discipline": "Process",
      "week": 1,
      "hours": 11,
      "fte": 0.32,
      "conflicts": []
    }
  ]
}
```

### POST /api/v1/resource-planning/recommend-team
**Request:**
```json
{
  "total_hours": 3500,
  "duration_weeks": 12
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "role": "Lead Engineer",
      "count": 0.5,
      "utilization": 60,
      "cost": 126000
    }
  ],
  "metadata": {
    "project_size": "medium",
    "coordination_overhead": 1.15,
    "base_fte_required": 6.2,
    "total_hours": 3500,
    "adjusted_hours": 4025,
    "duration_weeks": 12
  }
}
```

### POST /api/v1/resource-planning/reality-check
**Request:**
```json
{
  "deliverables": [...],
  "duration_weeks": 12,
  "total_hours": 3500
}
```

**Response:**
```json
{
  "warnings": [
    {
      "type": "staffing_spike",
      "severity": "high",
      "title": "Staffing Spike Detected",
      "message": "Week 5 requires 8.5 FTE (average: 5.8)",
      "recommendation": "Consider leveling workload or planning for temporary staff"
    }
  ]
}
```

---

## 🚀 Quick Reference

### Reality Factors Applied
| Factor | When | Multiplier |
|--------|------|------------|
| Ramp-up | Week 1-3 | 1.3x |
| Review Cycle | Every 4th week | 1.2x |
| Coordination | Project overhead | 1.1-1.25x |

### Utilization Targets
| Role | Utilization | Reasoning |
|------|-------------|-----------|
| Lead Engineer | 60% | Management duties |
| Senior Engineer | 85% | Standard billable |
| Engineer | 90% | High productivity |
| Junior Engineer | 95% | Learning phase |

### Warning Thresholds
| Type | Threshold | Action |
|------|-----------|--------|
| Fractional FTE | >1.0 and not integer | Round up or extend |
| Staffing Spike | >150% of average | Level or add temp staff |
| Low Utilization | <30% FTE | Consolidate work |
| Large Team | >15 people | Add coordination overhead |

---

## 📚 File Map

```
Project Root
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── router.py                    [MODIFIED: added resource_planning]
│   │   │   └── endpoints/
│   │   │       └── resource_planning.py     [NEW: API endpoints]
│   │   └── services/
│   │       └── resource_planning.py         [NEW: Core logic]
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── EstimationStepper.tsx        [MODIFIED: added 'resources' step]
    │   │   └── ResourcePlanning.tsx         [NEW: Main component]
    │   └── pages/
    │       └── ProjectEstimation.tsx        [MODIFIED: integrated ResourcePlanning]

Documentation
├── RESOURCE_PLANNING_SUMMARY.md            [Technical overview]
├── QUICK_START_RESOURCES.md                [Usage guide]
├── RESOURCE_PLANNING_FLOW.md               [This file: Flow diagrams]
└── GOOD_MORNING_README.md                  [Wake-up summary]
```

---

*Everything flows from deliverables to actionable resource decisions* 🎯
