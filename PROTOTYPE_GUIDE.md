# Equipment-Driven Estimation Prototypes

Two interactive prototypes demonstrating the **Two-Axis Estimation Model**:

## 🎯 Access the Prototypes

1. Start your development server: `npm run dev`
2. Navigate to Dashboard
3. Look in left sidebar under **"Experimental"**
4. Two prototype buttons available:
   - **⚙️ Equipment Builder** - Equipment → Deliverables
   - **🧪 Deliverables Config** - Issue States & Review Cycles

---

## Prototype 1: Equipment Builder

**Route:** `/equipment-prototype`

### What It Demonstrates

The **Equipment-Driven Deliverable Generation** concept - the foundation of the two-axis model.

### Key Features

1. **Equipment Templates**
   - 5 equipment types: Vessel, Pump, Heat Exchanger, Tank, Compressor
   - Each template defines deliverables it generates
   - Cross-discipline deliverable creation (one vessel → Civil, Mechanical, Process, E/I, Safety work)

2. **Size & Complexity Multipliers**
   - Small/Medium/Large affects hours (0.7× to 1.4×)
   - Simple/Standard/Complex affects hours (0.8× to 1.5×)
   - Example: Large complex vessel = 1.3 × 1.4 = 1.82× base hours

3. **Auto-Generation**
   - Add V-101 (vessel) → instantly creates 7 deliverables
   - Add P-101A/B (2 pumps) → creates 12 deliverables
   - Real-time calculation of total hours

4. **Change Management**
   - Delete equipment → shows impact ("This will remove 7 deliverables")
   - Add equipment → instant recalculation
   - Visual summary by discipline

### Try This

1. Click "⚙️ Vessel" quick add button
2. Enter tag "V-102"
3. Select Large + Complex
4. Click "Add Equipment"
5. Watch it generate 7 deliverables across 5 disciplines
6. Click "Show Deliverables" to see the full list
7. Notice how hours are multiplied by size/complexity factors

### Example Equipment Template

```javascript
vessel_template = {
  deliverables: [
    { name: 'Process Datasheet', discipline: 'Process', baseHours: 16 },
    { name: 'Mechanical Datasheet', discipline: 'Mechanical', baseHours: 12 },
    { name: 'Pressure Calculations', discipline: 'Mechanical', baseHours: 20 },
    { name: 'Nozzle Orientation Drawing', discipline: 'Mechanical', baseHours: 16 },
    { name: 'Foundation Design', discipline: 'Civil', baseHours: 24 },
    { name: 'Instrumentation Hookup', discipline: 'E/I', baseHours: 8 },
    { name: 'Relief Valve Sizing', discipline: 'Safety', baseHours: 8 }
  ],
  complexityFactors: { simple: 0.8, standard: 1.0, complex: 1.4 },
  sizeFactors: { small: 0.8, medium: 1.0, large: 1.3 }
}
```

---

## Prototype 2: Deliverables Configurator

**Route:** `/deliverables-prototype`

### What It Demonstrates

The **Issue State Progression & Review Cycles** concept - how deliverables flow through engineering stages.

### Key Features

1. **Issue State Progression**
   - IFD → IFR → IFA → IFB → IFC (each state adds effort)
   - Configurable per deliverable
   - Visual state flow with color coding

2. **Review Cycle Multipliers**
   - 0-5 review cycles per deliverable
   - Rework factor (15-30% per cycle)
   - Compounds with each cycle

3. **Client Complexity Profiles**
   - TYPE_A: 1.5× review cycles, 1.3× rework (heavy oversight)
   - TYPE_B: 1.0× baseline (standard)
   - TYPE_C: 0.7× review cycles, 0.8× rework (streamlined)

4. **Dependency Tracking**
   - Prerequisites between deliverables
   - Warning when dependencies not met
   - Example: Equipment datasheets require P&IDs at IFA state

5. **Regulatory Overlays**
   - HAZOP, SIL, FDA, HACCP tags
   - Auto-adds effort (e.g., HAZOP = +25%)

### Try This

1. Start with P&IDs selected (3 review cycles, HAZOP overlay)
2. Switch from TYPE_B to TYPE_A client
3. Watch hours jump from 851h to 1,040h
4. Click "Configure Issue States" on P&IDs
5. Uncheck IFD and IFR states
6. Watch hours drop to 620h (fast-track scenario)

### Calculation Example

**P&IDs with Full Phase-Gate Process:**

```
Base Hours: 120h

Issue State Effort:
  IFD (0.4×) = 48h
  IFR (0.6×) = 72h
  IFA (0.7×) = 84h
  IFB (0.9×) = 108h
  IFC (1.0×) = 120h
  Total State Effort = 432h

Review Cycles (TYPE_B):
  3 cycles × 0.30 rework = 432h × 0.90 = +389h

Regulatory Overlay:
  HAZOP = 120h × 0.25 = +30h

Total: 851h (7.1× base hours!)
```

**Same P&IDs, TYPE_A Client:**

```
Review Cycles (TYPE_A):
  (3 × 1.5) = 4.5 cycles
  4.5 × (0.30 × 1.3) = 1.76 rework factor
  432h × 1.76 = +760h

Total: 1,222h (10.2× base hours!)
```

---

## How They Work Together

### The Complete Two-Axis Model

```
Equipment List (Axis 1)        Project Type (Axis 2)        Result
     WHAT                             HOW
────────────────────────────────────────────────────────────────
V-101, P-101A/B, E-101    ×    Phase-Gate Execution    →  2,570h
(24 deliverables)              (IFD→IFR→IFA→IFB→IFC)
420 base hours                 (3-5 review cycles)

V-101, P-101A/B, E-101    ×    Fast-Track Execution    →  1,100h
(24 deliverables)              (IFR→IFC)
420 base hours                 (1-2 review cycles)

V-101, P-101A/B, E-101    ×    Campaign Execution      →    630h
(24 deliverables)              (Direct to IFC)
420 base hours                 (0 review cycles)
```

### Integration Vision

**Step 1: Equipment Builder** (Equipment Prototype)
- User adds equipment: V-101, P-101A, P-101B, E-101
- System generates 24 deliverables
- Base hours calculated: 420h

**Step 2: Deliverables Configuration** (Deliverables Prototype)
- User selects project type: Phase-Gate
- System applies issue states: IFD → IFR → IFA → IFB → IFC
- User sets client profile: TYPE_A
- System multiplies review cycles: 3 → 4.5
- Final hours: 2,570h

**Step 3: Export**
- WBS by discipline/equipment/phase
- Schedule with dependencies
- Cost breakdown by deliverable
- Risk-adjusted contingencies

---

## Why This Approach Works

### ✅ Completeness
Equipment templates ensure you don't forget deliverables. A pump needs foundation design, motor specs, seal plans - the template enforces this.

### ✅ Accuracy
Based on actual work (equipment count) not abstract "project size." 10 vessels is fundamentally different than 1 vessel, regardless of "project size."

### ✅ Transparency
Engineers see exactly what drives hours:
- V-101 needs 7 deliverables
- Each goes through 4 issue states
- TYPE_A client requires 4 review cycles
- = 380h for that one vessel

### ✅ Change Management
Add P-109 mid-project:
- Instantly generates 6 deliverables
- Calculates 42 new hours
- Shows dependencies (needs P&ID update)
- Updates Civil for new foundation

### ✅ Learning System
Track actuals vs estimates:
- "Vessels in pharma projects averaged 4.2 review cycles"
- "Complex pumps took 1.6× base hours (not 1.3×)"
- "Fast-track cut 30% of hours but added 2 weeks to schedule"

---

## Current vs. Future State

### Current System (What You Have)
- Project size multipliers (Small/Medium/Large)
- Phase-based deliverables
- Discipline selection
- Client complexity factors
- Manual deliverable matrix

**Issue:** Hours based on abstract "size" not actual equipment count

### Prototype System (These Prototypes)
- Equipment-driven deliverables
- Issue state progression
- Review cycle modeling
- Client complexity integration
- Dependency tracking

**Benefit:** Hours based on what actually needs to be done

### Future Integrated System
1. **Equipment Entry** → Add equipment with tags
2. **Auto-Generation** → System creates deliverables from templates
3. **Project Type Selection** → Determines issue state path
4. **Configuration** → Adjust review cycles, complexity
5. **Validation** → Check dependencies, flag issues
6. **Export** → WBS, schedule, cost breakdown

---

## Technical Implementation Notes

### Equipment Templates
- Start with 10-15 hardcoded templates
- Store as JSON initially (frontend)
- Later: user-editable via admin UI
- Eventually: industry-specific template libraries

### Data Model Changes Needed
```python
# New Equipment model
class Equipment:
    tag: str  # V-101
    template_key: str  # vessel, pump, heat_exchanger
    size: str  # small, medium, large
    complexity: str  # simple, standard, complex

# Enhanced Deliverable model
class Deliverable:
    parent_equipment_id: Optional[str]  # Links to equipment
    issue_states: List[str]  # [IFD, IFR, IFA, IFC]
    review_cycles: int
    rework_factor: float
```

### Integration Approach
1. **Phase 1:** Add Equipment List page to existing projects
2. **Phase 2:** Link equipment to deliverables matrix
3. **Phase 3:** Add issue state configuration
4. **Phase 4:** Full calculation engine with all factors

---

## Feedback & Next Steps

### Questions to Consider
1. Do the equipment templates match your actual work patterns?
2. Are the size/complexity multipliers realistic?
3. Would your team use the equipment builder interface?
4. Does the issue state progression align with your processes?
5. Are review cycle estimates accurate for your clients?

### Potential Enhancements
- Excel import for equipment lists
- Custom equipment template creation
- Historical data integration ("similar vessels averaged...")
- Schedule visualization with critical path
- Resource loading across disciplines

---

## Files Created

### Components
- `/frontend/src/components/EquipmentListBuilder.tsx` - Equipment builder UI
- `/frontend/src/components/DeliverablesMatrixEnhanced.tsx` - Deliverables configurator

### Pages
- `/frontend/src/pages/EquipmentPrototype.tsx` - Equipment prototype page
- `/frontend/src/pages/DeliverablesPrototype.tsx` - Deliverables prototype page

### Routes Added
- `/equipment-prototype` - Equipment builder route
- `/deliverables-prototype` - Deliverables configurator route

---

## Try It Now!

1. Navigate to Dashboard
2. Click **⚙️ Equipment Builder** in the Experimental section
3. Add some equipment and see deliverables generate
4. Click **🧪 Deliverables Config** to see how issue states multiply hours
5. Notice the cross-links between the two prototypes

**The magic:** Equipment Builder shows WHERE deliverables come from. Deliverables Configurator shows HOW they progress through engineering stages. Together = accurate estimation!
